/* @flow */
/* eslint-disable react/no-danger */

import React from 'react';
import Textarea from 'react-textarea-autosize';

type Props = {
  value: string,
  onValueChange: (value: string) => mixed,
  highlight: (value: string) => string,
  style?: {},
};

export default class Editor extends React.Component<Props> {
  render() {
    const { value, onValueChange, highlight, style, ...rest } = this.props;
    const highlighted = highlight(value);

    return (
      <div {...rest} style={{ ...styles.container, ...style }}>
        <Textarea
          style={{ ...styles.editor, ...styles.textarea }}
          value={value}
          onChange={e => onValueChange(e.target.value)}
          spellCheck="false"
        />
        <pre
          style={{ ...styles.editor, ...styles.highlight }}
          dangerouslySetInnerHTML={{ __html: highlighted }}
        />
      </div>
    );
  }
}

const styles = {
  container: {
    position: 'relative',
    whiteSpace: 'pre-wrap',
  },
  textarea: {
    display: 'block',
    height: '100%',
    width: '100%',
    margin: 0,
    padding: 0,
    border: 0,
    outline: 0,
    resize: 'none',
    MozOsxFontSmoothing: 'grayscale',
    WebkitFontSmoothing: 'antialiased',
    WebkitTextFillColor: 'transparent',
  },
  highlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
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
