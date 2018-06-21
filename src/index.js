/* @flow */
/* eslint-disable react/no-danger, react/sort-comp */

import React from 'react';

type Props = {
  value: string,
  onValueChange: (value: string) => mixed,
  highlight: (value: string) => string,
  style?: {},
};

type State = {
  value: string,
  html: string,
};

export default class Editor extends React.Component<Props, State> {
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

  render() {
    // eslint-disable-next-line no-unused-vars
    const { value, onValueChange, highlight, style, ...rest } = this.props;

    return (
      <div {...rest} style={{ ...styles.container, ...style }}>
        <div style={styles.content}>
          <textarea
            style={{ ...styles.editor, ...styles.textarea }}
            value={value}
            onChange={e => onValueChange(e.target.value)}
            spellCheck="false"
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
