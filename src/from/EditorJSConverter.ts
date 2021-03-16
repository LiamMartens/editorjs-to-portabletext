import shortid from 'shortid';
import { DOMParser } from 'xmldom';
import { extractSpansFromChildNodes } from './extractSpansFromChildNodes';
import type { EditorJsBlock, GenericMarkDefinition, PortableText } from '../types';
import { wrapInHtml } from '../utils';

export type MarkFactory = (node: ChildNode) => Omit<GenericMarkDefinition, '_key'>;
export type MarkConfig = Record<string, string | MarkFactory>;
export type ConverterConfig = Record<string, (block: EditorJsBlock, markConfig: MarkConfig) => (PortableText | PortableText[0])>;

export const InitialMarkConfig: MarkConfig = {
  i: 'em',
  b: 'strong',
  a: (node) => ({ _type: 'link', href: node instanceof HTMLAnchorElement ? node.href : '' }),
};

export const InitialConverterConfig: ConverterConfig = {
  paragraph: (block: EditorJsBlock<{ text: string }>, markConfig: MarkConfig) => {
    const nodes = Array.from((new DOMParser()).parseFromString(wrapInHtml('html', null, block.data.text), 'text/html').documentElement.childNodes);
    const { spans, definitions } = extractSpansFromChildNodes(nodes, markConfig);
    return {
      _key: shortid(),
      _type: 'block',
      style: 'normal',
      children: spans,
      markDefs: definitions,
    };
  },
  header: (block: EditorJsBlock<{ text: string; level: number; }>, markConfig: MarkConfig) => {
    const nodes = Array.from((new DOMParser()).parseFromString(wrapInHtml('html', null, block.data.text), 'text/html').documentElement.childNodes);
    const { spans, definitions } = extractSpansFromChildNodes(nodes, markConfig);
    return {
      _key: shortid(),
      _type: 'block',
      style: `h${block.data.level}`,
      children: spans,
      markDefs: definitions,
    };
  }
};

export class EditorJSConverter {
  private _markConfig: MarkConfig;
  private _converterConfig: ConverterConfig;

  constructor(markConfig: MarkConfig = {}, converterConfig: ConverterConfig = {}) {
    this._markConfig = { ...InitialMarkConfig, ...markConfig };
    this._converterConfig = { ...InitialConverterConfig, ...converterConfig };
  }

  public convert = (data: EditorJsBlock[]): PortableText => {
    let blocks: PortableText = [];
    for (const b of data) {
      const canConvert = b.type in this._converterConfig;
      if (!canConvert) {
        console.error(`Missing converter for type "${b.type}"`);
        continue;
      }
      const result = this._converterConfig[b.type](b, this._markConfig);
      if (Array.isArray(result)) blocks = blocks.concat(result);
      else blocks.push(result);
    }
    return blocks;
  }
}