# EditorJS to Portable Text
This library can be used to convert between a Editor.js block structure and a Sanity Portable Text structure.

## From EditorJS to Sanity
```
import { EditorJSConverter } from 'editorjs-to-portabletext';
const converter = new EditorJSConverter();
const portableText = converter.convert(editorJsContent);
```

## From Sanity to EditorJS
```
import { PortableTextConverter } from 'editorjs-to-portabletext';
const converter = new PortableTextConverter();
const editorJsContent = converter.convert(portableText);
```