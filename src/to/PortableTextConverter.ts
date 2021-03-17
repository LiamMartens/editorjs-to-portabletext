import { spansToHtml } from './spansToHtml';
import { wrapInHtml } from '../utils';
import type { EditorJsBlock, GenericMarkDefinition, PortableText } from '../types';

export type MarkConfig = Record<string, (content: string) => string>;
export type MarkDefConfig = Record<string, (content: string, def: GenericMarkDefinition) => string>;
export type ConverterConfig = Record<string, (block: PortableText[0], markConfig: MarkConfig, markDefConfig: MarkDefConfig) => (EditorJsBlock | EditorJsBlock[])>;
export type TransformerConfig = Record<string, (input: EditorJsBlock[]) => EditorJsBlock[]>;

export const InitialMarkConfig: MarkConfig = {
  strong: (content: string) => wrapInHtml('b', null, content),
  em: (content: string) => wrapInHtml('i', null, content),
};

export const InitialMarkDefConfig: MarkDefConfig = {
  link: (content: string, def: GenericMarkDefinition<{ href: string }>) => (
    wrapInHtml('a', { href: def.href }, content)
  )
};

export const InitialConverterConfig: ConverterConfig = {
  block: (block: PortableText[0], markConfig: MarkConfig, markDefConfig: MarkDefConfig) => {
    if ('listItem' in block && block.listItem === 'number') {
      return {
        type: 'list',
        data: {
          style: 'ordered',
          items: spansToHtml(block.children, block.markDefs, markConfig, markDefConfig)
        }
      }
    } else if ('listItem' in block && block.listItem === 'bullet') {
      return {
        type: 'list',
        data: {
          style: 'unordered',
          items: spansToHtml(block.children, block.markDefs, markConfig, markDefConfig)
        }
      }
    } else if (block.style === 'normal') {
      return {
        type: 'paragraph',
        data: {
          text: spansToHtml(block.children, block.markDefs, markConfig, markDefConfig)
        }
      };
    }
    else if (block.style.startsWith('h')) {
      const level = parseInt(block.style.substring(1), 10);
      return {
        type: 'header',
        data: {
          level,
          text: spansToHtml(block.children, block.markDefs, markConfig, markDefConfig)
        }
      };
    }
  }
};

export const InitialTransformerConfig: TransformerConfig = {
  list: (input) => {
    for (let i = 1; i < input.length; i++) {
      const node = input[i];
      const prev = input[i - 1];
      if (
        node.type === 'list'
        && prev.type === 'list'
        && node.data.style === prev.data.style
      ) {
        prev.data.items = prev.data.items.concat(node.data.items);
        input.splice(i, 1);
        i--;
      }
    }
    return input;
  }
}

export class PortableTextConverter {
  private _markConfig: MarkConfig;
  private _markDefConfig: MarkDefConfig;
  private _converterConfig: ConverterConfig;
  private _transformerConfig: TransformerConfig;

  constructor(markConfig: MarkConfig = {}, markDefConfig: MarkDefConfig = {}, converterConfig: ConverterConfig = {}, transformerConfig: TransformerConfig = {}) {
    this._markConfig = { ...InitialMarkConfig, ...markConfig };
    this._markDefConfig = { ...InitialMarkDefConfig, ...markDefConfig };
    this._converterConfig = { ...InitialConverterConfig, ...converterConfig };
    this._transformerConfig = { ...InitialTransformerConfig, ...transformerConfig };
  }

  public convert = (data: PortableText): EditorJsBlock[] => {
    let blocks: EditorJsBlock[] = [];
    for (const b of data) {
      const canConvert = b._type in this._converterConfig;
      if (!canConvert) {
        console.error(`Missing converter for type "${b._type}"`);
        continue;
      }
      const result = this._converterConfig[b._type](b, this._markConfig, this._markDefConfig);
      if (Array.isArray(result)) blocks = blocks.concat(result);
      else blocks.push(result);
    }
    for (const k in this._transformerConfig) {
      blocks = this._transformerConfig[k](blocks);
    }
    return blocks;
  }
}