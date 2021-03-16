export const wrapInHtml = (tagName: string, attrs: Record<string, string | number> | null, content: string) => {
  const attributes = attrs ? Object.keys(attrs).map(k => `${k}="${JSON.stringify(attrs[k])}"`) : null;
  return `<${[tagName, attributes].filter(Boolean).join(' ')}>${content}</${tagName}>`;
}