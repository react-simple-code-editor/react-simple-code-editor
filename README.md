react-simple-code-editor
========================

Simple no-frills code editor with syntax highlighting.

## Why

Several browser based code editors such as Ace, CodeMirror, Monaco etc. provide the ability to embed a full-featured code editor in your web page. However, if you just need a simple editor with syntax highlighting without any of the extra features, they can be overkill as they don't usually have a small bundle size footprint. This library aims to provide a simple code editor with syntax highlighting support without any of the extra features.

## Usage

```js
import React from 'react';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-jsx';

const code = `export default function App() {
  return <div>Hello world</div>
}
`;

class App extends React.Component {
  state = { code };

  render() {
    return (
      <Editor
        value={this.state.code}
        onValueChange={value => this.setState({ code: value })}
        highlight={code => highlight(code, languages.jsx)}
        style={{
          width: '100%',
          height: '100%',
          fontFamily:
            '"Fira code", Consolas, "Liberation Mono", Menlo, Courier, monospace',
          fontSize: 12,
          fontVariantLigatures: 'common-ligatures',
        }}
      />
    );
  }
}
```

## Running the example

You can try out the example by running `yarn example`.

## How it works

It works by overlaying a syntax highlighted `<pre>` block over a `<textarea>`. When you type or select text, you interact with the underlying `<textarea>`, so the experience feels native. This is a very simple approach compared to other editors which re-implement the behaviour.

The syntax highlighting can be done by any library and it's fully controllable by the user.
