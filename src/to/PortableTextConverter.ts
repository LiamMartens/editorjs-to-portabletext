import { spansToHtml } from './spansToHtml';
import type { Block, MarkDefinition, Span } from '@sanity/types';
import type { EditorJsBlock, GenericMarkDefinition, PortableText } from '../types';
import { wrapInHtml } from '../utils';

export type MarkConfig = Record<string, (content: string) => string>;
export type MarkDefConfig = Record<string, (content: string, def: GenericMarkDefinition) => string>;
export type ConverterConfig = Record<string, (block: PortableText[0], markConfig: MarkConfig, markDefConfig: MarkDefConfig) => (EditorJsBlock | EditorJsBlock[])>;

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
    if (block.style === 'normal') {
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

export class PortableTextConverter {
  private _markConfig: MarkConfig;
  private _markDefConfig: MarkDefConfig;
  private _converterConfig: ConverterConfig;

  constructor(markConfig: MarkConfig = {}, markDefConfig: MarkDefConfig = {}, converterConfig: ConverterConfig = {}) {
    this._markConfig = { ...InitialMarkConfig, ...markConfig };
    this._markDefConfig = { ...InitialMarkDefConfig, ...markDefConfig };
    this._converterConfig = { ...InitialConverterConfig, ...converterConfig };
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
    return blocks;
  }
}