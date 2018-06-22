react-simple-code-editor
========================

Simple no-frills code editor with syntax highlighting.

<a href="https://raw.githubusercontent.com/satya164/react-simple-code-editor/master/demo/demo.gif"><img src="https://raw.githubusercontent.com/satya164/react-simple-code-editor/master/demo/demo.gif" width="400"></a>

## Why

Several browser based code editors such as Ace, CodeMirror, Monaco etc. provide the ability to embed a full-featured code editor in your web page. However, if you just need a simple editor with syntax highlighting without any of the extra features, they can be overkill as they don't usually have a small bundle size footprint. This library aims to provide a simple code editor with syntax highlighting support without any of the extra features.

## Features

- Syntax highlighting with third party library
- Tab key support with cutomizable indentation
- Automatic indent on new lines
- Undo whole words instead of letter by letter

## Installation

```sh
npm install react-simple-code-editor
```

or

```sh
yarn add react-simple-code-editor
```

## Usage

You need to use the editor with a third party library which provides syntax highlighting. For example, it'll look like following with [`prismjs`](https://prismjs.com):

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
        onValueChange={code => this.setState({ code })}
        highlight={code => highlight(code, languages.jsx)}
        style={{
          width: '100%',
          height: '100%',
          fontFamily: '"Fira code", monospace',
          fontSize: 12,
        }}
      />
    );
  }
}
```

## Props

- `value` (`string`): Current value of the editor. Pass the code to display as a prop.
- `onValueChange` (`string => mixed`): Callback which is called when the value of the editor changes. You'll need to [update the value prop](https://reactjs.org/docs/forms.html#controlled-components) when this is called.
- `highlight` (`string => string`): Callback which will receive text to highlight. You'll need to return HTML with syntax highlighting using a library such as [`prismjs`](https://prismjs.com).
- `tabSize` (`number`): Optional prop to control the tab size. For example, for 4 space indentation, `tabSize` will be `4` and `insertSpaces` will be `true`. Default: `2`.
- `insertSpaces` (`boolean`): Optional prop to control whether to use spaces for indentation. Default: `true`.

## How it works

It works by overlaying a syntax highlighted `<pre>` block over a `<textarea>`. When you type, select, copy text etc., you interact with the underlying `<textarea>`, so the experience feels native. This is a very simple approach compared to other editors which re-implement the behaviour.

The syntax highlighting can be done by any third party library as long as it returns HTML and is fully controllable by the user.

The vanilla `<textarea>` doesn't support inserting tab characters for indentation, so we re-implement it by listening to `keydown` events and programmatically updating the text. One caveat with programmatically updating the text is that we lose the undo stack, so we need to maintain our own undo stack. As a result, we can also implement improved undo behaviour such as undoing whole words similar to editors like VSCode.

## Known issues

Using the undo/redo option from browser's context menu can mess things up.

## Contributing

While developing, you can run the example app to test your changes:

```sh
yarn example
```

Make sure your code passes Flow and ESLint. Run the following to verify:

```sh
yarn flow
yarn lint
```

To fix formatting errors, run the following:

```sh
yarn lint -- --fix
```
