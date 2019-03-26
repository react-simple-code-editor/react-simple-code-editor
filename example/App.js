/* @flow */
/* global require */
/* eslint-disable import/no-commonjs */

import React from 'react';
import ReactDOM from 'react-dom';
import Editor from '../src/index';
import dedent from 'dedent';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-markup';
import './styles.css';

// import doesn't seem to work properly with parcel for jsx
require('prismjs/components/prism-jsx');

type State = {
  code: string,
};

class App extends React.Component<{}, State> {
  state = {
    code: dedent`
    import React from "react";
    import ReactDOM from "react-dom";

    function App() {
      return (
        <h1>Hello world</h1>
      );
    }

    ReactDOM.render(<App />, document.getElementById("root"));
    `,
  };

  render() {
    return (
      <main className="container">
        <div className="container__content">
          <h1>react-simple-code-editor</h1>
          <p>A simple no-frills code editor with syntax highlighting.</p>
          <a
            className="button"
            href="https://github.com/satya164/react-simple-code-editor"
          >
            GitHub
          </a>
          <div className="container_editor_area">
            <Editor
              placeholder="Type some code…"
              value={this.state.code}
              onValueChange={code => this.setState({ code })}
              highlight={code => highlight(code, languages.jsx)}
              padding={10}
              className="container__editor"
            />
          </div>
        </div>
      </main>
    );
  }
}

/* $FlowFixMe */
ReactDOM.render(<App />, document.getElementById('root'));
