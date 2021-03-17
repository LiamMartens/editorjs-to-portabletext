import { nanoid } from 'nanoid';
import type { MarkConfig } from './EditorJSConverter';
import type { MarkDefinition, Span } from '@sanity/types';

export const extractSpansFromChildNodes = (
  nodes: ChildNode[],
  config: MarkConfig,
) => {
  console.log(nodes[0].nodeType, nodes[0].nodeName)
  let spans: Span[] = [];
  let definitions: MarkDefinition[] = [];
  for (const node of nodes) {
    if (node.nodeType === 3) {
      // TEXT_NODE
      spans.push({
        _key: nanoid(),
        _type: 'span',
        text: node.textContent,
        marks: [],
      });
    } else if (node.nodeType === 1) {
      // ELEMENT_NODE
      let subtree = extractSpansFromChildNodes(Array.from(node.childNodes), config);
      const nodeName = node.nodeName.toLowerCase();
      if (nodeName in config) {
        const markFactory = config[nodeName];
        if (typeof markFactory === 'string') {
          for (const c of subtree.spans) { c.marks.push(markFactory); }
        } else {
          const def = { ...markFactory(node), _key: nanoid() } as MarkDefinition;
          subtree.definitions.push(def);
          for (const c of subtree.spans) { c.marks.push(def._key); }
        }
      }
      spans = spans.concat(subtree.spans);
      definitions = definitions.concat(subtree.definitions);
    }
  }
  return { spans, definitions };
}