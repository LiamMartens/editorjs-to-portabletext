import { Span } from '@sanity/types';
import { GenericMarkDefinition } from '../types';
import type { MarkConfig, MarkDefConfig } from './PortableTextConverter';

export const spansToHtml = (
  spans: Span[],
  markDefs: GenericMarkDefinition,
  markConfig: MarkConfig,
  markDefConfig: MarkDefConfig,
) => {
  return spans.map(span => {
    let content = span.text;
    for (const m of span.marks) {
      if (m in markConfig) { content = markConfig[m](content); }
      else if (m in markDefs && markDefs[m]._type in markDefConfig) { content = markDefConfig[markDefs[m]._type](content, markDefs[m]); }
    }
  });
}