/* @flow */
/* eslint-disable react/no-danger, react/sort-comp */

import React from 'react';

type Props = {
  value: string,
  onValueChange: (value: string) => mixed,
  highlight: (value: string) => string,
  tabSize: number,
  insertSpaces: boolean,
  style?: {},
};

type State = {
  value: string,
  html: string,
};

type Record = {
  value: string,
  selectionStart: number,
  selectionEnd: number,
};

const KEYCODE_TAB = 9;
const KEYCODE_BACKSPACE = 8;
const KEYCODE_Z = 90;

const HISTORY_LIMIT = 100;

export default class Editor extends React.Component<Props, State> {
  static defaultProps = {
    tabSize: 2,
    insertSpaces: true,
  };

  static getDerivedStateFromProps(props: Props, state: State) {
    if (props.value !== state.value) {
      return {
        value: props.value,
        html: props.highlight(props.value),
      };
    }

    return null;
  }

  state = {
    value: this.props.value,
    html: this.props.highlight(this.props.value),
  };

  componentDidMount() {
    this._recordCurrentState();
  }

  _recordCurrentState = () => {
    const input = this._input;

    if (!input) return;

    // Save current state of the input
    const { value, selectionStart, selectionEnd } = input;

    this._recordChange({
      value,
      selectionStart,
      selectionEnd,
    });
  };

  _recordChange = (record: Record) => {
    const { stack, offset } = this._history;

    if (stack.length && offset > -1) {
      // When something updates, drop the redo operations
      this._history.stack = stack.slice(0, offset + 1);

      // Limit the number of operations to 100
      const count = this._history.stack.length;

      if (count > HISTORY_LIMIT) {
        const extras = count - HISTORY_LIMIT;

        this._history.stack = stack.slice(extras, count);
        this._history.offset = Math.max(this._history.offset - extras, 0);
      }
    }

    // Add the new operation to the stack
    this._history.stack.push(record);
    this._history.offset++;
  };

  _updateInput = (record: Record) => {
    const input = this._input;

    if (!input) return;

    // Update values and selection state
    input.value = record.value;
    input.selectionStart = record.selectionStart;
    input.selectionEnd = record.selectionEnd;

    this.props.onValueChange(record.value);
  };

  _applyEdits = (record: Record) => {
    this._recordChange(record);
    this._updateInput(record);
  };

  _undoEdit = () => {
    const { stack, offset } = this._history;

    // Get the previous edit
    const record = stack[offset - 1];

    if (record) {
      // Apply the changes and update the offset
      this._updateInput(record);
      this._history.offset = Math.max(offset - 1, 0);
    }
  };

  _redoEdit = () => {
    const { stack, offset } = this._history;

    // Get the next edit
    const record = stack[offset + 1];

    if (record) {
      // Apply the changes and update the offset
      this._updateInput(record);
      this._history.offset = Math.min(offset + 1, stack.length - 1);
    }
  };

  _handleKeyDown = (e: *) => {
    const { tabSize, insertSpaces } = this.props;
    const tabCharacter = (insertSpaces ? ' ' : '     ').repeat(tabSize);

    if (e.keyCode === KEYCODE_TAB) {
      // Prevent focus change
      e.preventDefault();

      const { value, selectionStart, selectionEnd } = e.target;

      if (selectionStart === selectionEnd) {
        const updatedSelection = selectionStart + tabCharacter.length;

        this._applyEdits({
          // Insert tab character at caret
          value:
            value.substring(0, selectionStart) +
            tabCharacter +
            value.substring(selectionEnd),
          // Update caret position
          selectionStart: updatedSelection,
          selectionEnd: updatedSelection,
        });
      } else {
        // Indent selected lines
        const startLine =
          value.substring(0, selectionStart).split('\n').length - 1;
        const endLine = value.substring(0, selectionEnd).split('\n').length - 1;

        this._applyEdits({
          value: value
            .split('\n')
            .map((line, i) => {
              if (i >= startLine && i <= endLine) {
                return tabCharacter + line;
              }

              return line;
            })
            .join('\n'),
          // Update caret position
          selectionStart: selectionStart + tabCharacter.length,
          selectionEnd:
            selectionEnd + tabCharacter.length * (endLine - startLine + 1),
        });
      }
    } else if (e.keyCode === KEYCODE_BACKSPACE) {
      const { value, selectionStart, selectionEnd } = e.target;
      const hasSelection = selectionStart !== selectionEnd;
      const textBeforeCaret = value.substring(0, selectionStart);

      if (textBeforeCaret.endsWith(tabCharacter) && !hasSelection) {
        // Prevent default delete behaviour
        e.preventDefault();

        const updatedSelection = selectionStart - tabCharacter.length;

        this._applyEdits({
          // Remove tab character at caret
          value:
            value.substring(0, selectionStart - tabCharacter.length) +
            value.substring(selectionEnd),
          // Update caret position
          selectionStart: updatedSelection,
          selectionEnd: updatedSelection,
        });
      }
    } else if (
      e.keyCode === KEYCODE_Z &&
      e.metaKey !== e.ctrlKey &&
      !e.altKey
    ) {
      e.preventDefault();

      // Undo / Redo
      if (e.shiftKey) {
        this._redoEdit();
      } else {
        this._undoEdit();
      }
    }
  };

  _handleChange = (e: *) => {
    const { value, selectionStart, selectionEnd } = e.target;

    this._recordChange({
      value,
      selectionStart,
      selectionEnd,
    });

    this.props.onValueChange(value);
  };

  _history = {
    stack: [],
    offset: -1,
  };

  _input: ?HTMLTextAreaElement;

  render() {
    const {
      value,
      style,
      /* eslint-disable no-unused-vars */
      onValueChange,
      highlight,
      tabSize,
      insertSpaces,
      /* eslint-enable no-unused-vars */
      ...rest
    } = this.props;

    return (
      <div {...rest} style={{ ...styles.container, ...style }}>
        <div style={styles.content}>
          <textarea
            ref={c => (this._input = c)}
            onKeyDown={this._handleKeyDown}
            style={{ ...styles.editor, ...styles.textarea }}
            value={value}
            onChange={this._handleChange}
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            data-gramm={false}
          />
          <pre
            style={{ ...styles.editor, ...styles.highlight }}
            dangerouslySetInnerHTML={{ __html: this.state.html + '<br />' }}
          />
        </div>
      </div>
    );
  }
}

const styles = {
  container: {
    overflow: 'auto',
  },
  content: {
    position: 'relative',
    whiteSpace: 'pre-wrap',
    minHeight: '100%',
    overflow: 'hidden',
  },
  textarea: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    width: '100%',
    margin: 0,
    padding: 0,
    border: 0,
    outline: 0,
    resize: 'none',
    overflow: 'hidden',
    MozOsxFontSmoothing: 'grayscale',
    WebkitFontSmoothing: 'antialiased',
    WebkitTextFillColor: 'transparent',
  },
  highlight: {
    position: 'relative',
    display: 'block',
    margin: 0,
    padding: 0,
    pointerEvents: 'none',
  },
  editor: {
    letterSpacing: 'inherit',
    lineHeight: 'inherit',
    fontFamily: 'inherit',
    fontWeight: 'inherit',
    fontSize: 'inherit',
    fontStyle: 'inherit',
    fontVariantLigatures: 'inherit',
    tabSize: 'inherit',
    textRendering: 'inherit',
    textTransform: 'inherit',
    textIndent: 'inherit',
    whiteSpace: 'inherit',
    paddingTop: 'inherit',
    paddingRight: 'inherit',
    paddingBottom: 'inherit',
    paddingLeft: 'inherit',
    borderTopWidth: 'inherit',
    borderRightWidth: 'inherit',
    borderBottomWidth: 'inherit',
    borderLeftWidth: 'inherit',
    boxSizing: 'inherit',
  },
};
