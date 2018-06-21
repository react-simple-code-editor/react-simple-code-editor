/* @flow */

import React from 'react';
import ReactDOM from 'react-dom';
import Editor from '../src/index';
import dedent from 'dedent';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-jsx';
import './styles.css';

type State = {
  code: string,
};

class App extends React.Component<{}, State> {
  state = {
    code: dedent`
    export default function App() {
      return <div>Hello world</div>
    }
    `,
  };

  render() {
    return (
      <Editor
        value={this.state.code}
        onValueChange={code => this.setState({ code })}
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

/* $FlowFixMe */
ReactDOM.render(<App />, document.getElementById('root'));
