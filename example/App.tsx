/* global require */

import React from 'react';
import { createRoot } from 'react-dom/client';
import Editor from '../src/index';
import dedent from 'dedent';
import { highlight, languages } from 'prismjs';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-markup';
import './styles.css';

type State = {
  code: string;
};

// import doesn't seem to work properly with parcel for jsx
// eslint-disable-next-line import/no-commonjs
require('prismjs/components/prism-jsx');

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
            href="https://github.com/react-simple-code-editor/react-simple-code-editor"
          >
            GitHub
          </a>
          <div className="container_editor_area">
            <Editor
              placeholder="Type some code…"
              value={this.state.code}
              onValueChange={(code) => this.setState({ code })}
              highlight={(code) => highlight(code, languages.jsx!, 'jsx')}
              padding={10}
              className="container__editor"
            />
          </div>
        </div>
      </main>
    );
  }
}

const container = document.getElementById('root');
const root = createRoot(container!);

root.render(<App />);
