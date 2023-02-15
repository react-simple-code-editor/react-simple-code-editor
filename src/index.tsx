import * as React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';

type Padding<T> = T | { top?: T; right?: T; bottom?: T; left?: T };

type Props = React.HTMLAttributes<HTMLDivElement> & {
  // Props for the component
  value: string;
  onValueChange: (value: string) => void;
  highlight: (value: string) => string | React.ReactNode;
  tabSize: number;
  insertSpaces: boolean;
  ignoreTabKey: boolean;
  padding: Padding<number | string>;
  style?: React.CSSProperties;
  inputRef: React.RefObject<HTMLTextAreaElement>;

  // Props for the textarea
  textareaId?: string;
  textareaClassName?: string;
  autoFocus?: boolean;
  disabled?: boolean;
  form?: string;
  maxLength?: number;
  minLength?: number;
  name?: string;
  placeholder?: string;
  readOnly?: boolean;
  required?: boolean;
  onClick?: React.MouseEventHandler<HTMLTextAreaElement>;
  onFocus?: React.FocusEventHandler<HTMLTextAreaElement>;
  onBlur?: React.FocusEventHandler<HTMLTextAreaElement>;
  onKeyUp?: React.KeyboardEventHandler<HTMLTextAreaElement>;
  onKeyDown?: React.KeyboardEventHandler<HTMLTextAreaElement>;

  // Props for the hightlighted code’s pre element
  preClassName?: string;
};

type Record = {
  value: string;
  selectionStart: number;
  selectionEnd: number;
};

type History = {
  stack: (Record & { timestamp: number })[];
  offset: number;
};

const KEYCODE_Y = 89;
const KEYCODE_Z = 90;
const KEYCODE_M = 77;
const KEYCODE_PARENS = 57;
const KEYCODE_BRACKETS = 219;
const KEYCODE_QUOTE = 222;
const KEYCODE_BACK_QUOTE = 192;

const HISTORY_LIMIT = 100;
const HISTORY_TIME_GAP = 3000;

const isWindows =
  typeof window !== 'undefined' &&
  'navigator' in window &&
  /Win/i.test(navigator.platform);
const isMacLike =
  typeof window !== 'undefined' &&
  'navigator' in window &&
  /(Mac|iPhone|iPod|iPad)/i.test(navigator.platform);

const className = 'npm__react-simple-code-editor__textarea';

const cssText = /* CSS */ `
/**
 * Reset the text fill color so that placeholder is visible
 */
.${className}:empty {
  -webkit-text-fill-color: inherit !important;
}

/**
 * Hack to apply on some CSS on IE10 and IE11
 */
@media all and (-ms-high-contrast: none), (-ms-high-contrast: active) {
  /**
    * IE doesn't support '-webkit-text-fill-color'
    * So we use 'color: transparent' to make the text transparent on IE
    * Unlike other browsers, it doesn't affect caret color in IE
    */
  .${className} {
    color: transparent !important;
  }

  .${className}::selection {
    background-color: #accef7 !important;
    color: transparent !important;
  }
}
`;

function getLines(text: string, position: number) {
  return text.substring(0, position).split('\n');
}

export default function Editor({
  tabSize = 2,
  insertSpaces = true,
  ignoreTabKey = false,
  padding = 0,
  ...rest
}: Props) {
  const [capture, setCapture] = useState(true);
  const history = useRef<History>({ stack: [], offset: -1 });

  const {
    value,
    inputRef,
    style,
    highlight,
    textareaId,
    textareaClassName,
    autoFocus,
    disabled,
    form,
    maxLength,
    minLength,
    name,
    placeholder,
    readOnly,
    required,
    onClick,
    onFocus,
    onBlur,
    onKeyUp,
    /* eslint-disable @typescript-eslint/no-unused-vars */
    onKeyDown,
    onValueChange,
    /* eslint-enable @typescript-eslint/no-unused-vars */
    preClassName,
    ...divProps
  } = rest;

  const contentStyle = {
    paddingTop: typeof padding === 'object' ? padding.top : padding,
    paddingRight: typeof padding === 'object' ? padding.right : padding,
    paddingBottom: typeof padding === 'object' ? padding.bottom : padding,
    paddingLeft: typeof padding === 'object' ? padding.left : padding,
  };

  const highlighted = highlight(value);

  const recordChange = useCallback(
    (record: Record, overwrite: boolean = false) => {
      const h = history.current;

      if (!h) {
        return;
      }

      if (h.stack.length && h.offset > -1) {
        // When something updates, drop the redo operations
        h.stack = h.stack.slice(0, h.offset + 1);

        // Limit the number of operations to 100
        const count = h.stack.length;

        if (count > HISTORY_LIMIT) {
          const extras = count - HISTORY_LIMIT;

          h.stack = h.stack.slice(extras, count);
          h.offset = Math.max(h.offset - extras, 0);
        }
      }

      const timestamp = Date.now();

      if (overwrite) {
        const last = h.stack[h.offset];

        if (last && timestamp - last.timestamp < HISTORY_TIME_GAP) {
          // A previous entry exists and was in short interval

          // Match the last word in the line
          const re = /[^a-z0-9]([a-z0-9]+)$/i;

          // Get the previous line
          const previous = getLines(last.value, last.selectionStart)
            .pop()
            ?.match(re);

          // Get the current line
          const current = getLines(record.value, record.selectionStart)
            .pop()
            ?.match(re);

          if (previous?.[1] && current?.[1]?.startsWith(previous[1])) {
            // The last word of the previous line and current line match
            // Overwrite previous entry so that undo will remove whole word
            h.stack[h.offset] = { ...record, timestamp };

            return;
          }
        }
      }

      // Add the new operation to the stack
      h.stack.push({ ...record, timestamp });
      h.offset++;
    },
    []
  );

  const updateInput = useCallback(
    (record: Record) => {
      if (!inputRef.current) {
        return;
      }

      inputRef.current.value = record.value;
      inputRef.current.selectionStart = record.selectionStart;
      inputRef.current.selectionEnd = record.selectionEnd;

      onValueChange(record.value);
    },
    [inputRef, onValueChange]
  );

  const applyEdits = useCallback(
    (record: Record) => {
      if (!inputRef.current || !history.current) {
        return;
      }

      const last = history.current.stack[history.current.offset];

      if (last) {
        history.current.stack[history.current.offset] = {
          ...last,
          selectionStart: inputRef.current.selectionStart,
          selectionEnd: inputRef.current.selectionEnd,
        };
      }

      recordChange(record);
      updateInput(record);
    },
    [inputRef, recordChange, updateInput]
  );

  const undoEdit = useCallback(() => {
    if (!history.current) {
      return;
    }

    const { stack, offset } = history.current;

    // Get the previous edit
    const record = stack[offset - 1];

    if (record) {
      // Apply the changes and update the offset
      updateInput(record);
      history.current.offset = Math.max(offset - 1, 0);
    }
  }, [updateInput]);

  const redoEdit = useCallback(() => {
    if (!history.current) {
      return;
    }

    const { stack, offset } = history.current;

    // Get the next edit
    const record = stack[offset + 1];

    if (record) {
      // Apply the changes and update the offset
      updateInput(record);
      history.current.offset = Math.min(offset + 1, stack.length - 1);
    }
  }, [updateInput]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Escape') {
        e.currentTarget.blur();
      }

      const { value, selectionStart, selectionEnd } = e.currentTarget;

      const tabCharacter = (insertSpaces ? ' ' : '\t').repeat(tabSize);

      if (e.key === 'Tab' && !ignoreTabKey && capture) {
        // Prevent focus change
        e.preventDefault();

        if (e.shiftKey) {
          // Unindent selected lines
          const linesBeforeCaret = getLines(value, selectionStart);
          const startLine = linesBeforeCaret.length - 1;
          const endLine = getLines(value, selectionEnd).length - 1;
          const nextValue = value
            .split('\n')
            .map((line, i) => {
              if (
                i >= startLine &&
                i <= endLine &&
                line.startsWith(tabCharacter)
              ) {
                return line.substring(tabCharacter.length);
              }

              return line;
            })
            .join('\n');

          if (value !== nextValue) {
            const startLineText = linesBeforeCaret[startLine];

            applyEdits({
              value: nextValue,
              // Move the start cursor if first line in selection was modified
              // It was modified only if it started with a tab
              selectionStart: startLineText?.startsWith(tabCharacter)
                ? selectionStart - tabCharacter.length
                : selectionStart,
              // Move the end cursor by total number of characters removed
              selectionEnd: selectionEnd - (value.length - nextValue.length),
            });
          }
        } else if (selectionStart !== selectionEnd) {
          // Indent selected lines
          const linesBeforeCaret = getLines(value, selectionStart);
          const startLine = linesBeforeCaret.length - 1;
          const endLine = getLines(value, selectionEnd).length - 1;
          const startLineText = linesBeforeCaret[startLine];

          applyEdits({
            value: value
              .split('\n')
              .map((line, i) => {
                if (i >= startLine && i <= endLine) {
                  return tabCharacter + line;
                }

                return line;
              })
              .join('\n'),
            // Move the start cursor by number of characters added in first line of selection
            // Don't move it if it there was no text before cursor
            selectionStart:
              startLineText && /\S/.test(startLineText)
                ? selectionStart + tabCharacter.length
                : selectionStart,
            // Move the end cursor by total number of characters added
            selectionEnd:
              selectionEnd + tabCharacter.length * (endLine - startLine + 1),
          });
        } else {
          const updatedSelection = selectionStart + tabCharacter.length;

          applyEdits({
            // Insert tab character at caret
            value:
              value.substring(0, selectionStart) +
              tabCharacter +
              value.substring(selectionEnd),
            // Update caret position
            selectionStart: updatedSelection,
            selectionEnd: updatedSelection,
          });
        }
      } else if (e.key === 'Backspace') {
        const hasSelection = selectionStart !== selectionEnd;
        const textBeforeCaret = value.substring(0, selectionStart);

        if (textBeforeCaret.endsWith(tabCharacter) && !hasSelection) {
          // Prevent default delete behaviour
          e.preventDefault();

          const updatedSelection = selectionStart - tabCharacter.length;

          applyEdits({
            // Remove tab character at caret
            value:
              value.substring(0, selectionStart - tabCharacter.length) +
              value.substring(selectionEnd),
            // Update caret position
            selectionStart: updatedSelection,
            selectionEnd: updatedSelection,
          });
        }
      } else if (e.key === 'Enter') {
        // Ignore selections
        if (selectionStart === selectionEnd) {
          // Get the current line
          const line = getLines(value, selectionStart).pop();
          const matches = line?.match(/^\s+/);

          if (matches?.[0]) {
            e.preventDefault();

            // Preserve indentation on inserting a new line
            const indent = '\n' + matches[0];
            const updatedSelection = selectionStart + indent.length;

            applyEdits({
              // Insert indentation character at caret
              value:
                value.substring(0, selectionStart) +
                indent +
                value.substring(selectionEnd),
              // Update caret position
              selectionStart: updatedSelection,
              selectionEnd: updatedSelection,
            });
          }
        }
      } else if (
        e.keyCode === KEYCODE_PARENS ||
        e.keyCode === KEYCODE_BRACKETS ||
        e.keyCode === KEYCODE_QUOTE ||
        e.keyCode === KEYCODE_BACK_QUOTE
      ) {
        let chars;

        if (e.keyCode === KEYCODE_PARENS && e.shiftKey) {
          chars = ['(', ')'];
        } else if (e.keyCode === KEYCODE_BRACKETS) {
          if (e.shiftKey) {
            chars = ['{', '}'];
          } else {
            chars = ['[', ']'];
          }
        } else if (e.keyCode === KEYCODE_QUOTE) {
          if (e.shiftKey) {
            chars = ['"', '"'];
          } else {
            chars = ["'", "'"];
          }
        } else if (e.keyCode === KEYCODE_BACK_QUOTE && !e.shiftKey) {
          chars = ['`', '`'];
        }

        // If text is selected, wrap them in the characters
        if (selectionStart !== selectionEnd && chars) {
          e.preventDefault();

          applyEdits({
            value:
              value.substring(0, selectionStart) +
              chars[0] +
              value.substring(selectionStart, selectionEnd) +
              chars[1] +
              value.substring(selectionEnd),
            // Update caret position
            selectionStart,
            selectionEnd: selectionEnd + 2,
          });
        }
      } else if (
        (isMacLike
          ? // Trigger undo with ⌘+Z on Mac
            e.metaKey && e.keyCode === KEYCODE_Z
          : // Trigger undo with Ctrl+Z on other platforms
            e.ctrlKey && e.keyCode === KEYCODE_Z) &&
        !e.shiftKey &&
        !e.altKey
      ) {
        e.preventDefault();

        undoEdit();
      } else if (
        (isMacLike
          ? // Trigger redo with ⌘+Shift+Z on Mac
            e.metaKey && e.keyCode === KEYCODE_Z && e.shiftKey
          : isWindows
          ? // Trigger redo with Ctrl+Y on Windows
            e.ctrlKey && e.keyCode === KEYCODE_Y
          : // Trigger redo with Ctrl+Shift+Z on other platforms
            e.ctrlKey && e.keyCode === KEYCODE_Z && e.shiftKey) &&
        !e.altKey
      ) {
        e.preventDefault();

        redoEdit();
      } else if (
        e.keyCode === KEYCODE_M &&
        e.ctrlKey &&
        (isMacLike ? e.shiftKey : true)
      ) {
        e.preventDefault();

        // Toggle capturing tab key so users can focus away
        setCapture(!capture);
      }
    },
    [
      applyEdits,
      capture,
      ignoreTabKey,
      insertSpaces,
      redoEdit,
      tabSize,
      undoEdit,
    ]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const { value, selectionStart, selectionEnd } = e.currentTarget;

      recordChange(
        {
          value,
          selectionStart,
          selectionEnd,
        },
        true
      );

      onValueChange(value);
    },
    [onValueChange, recordChange]
  );

  useEffect(() => {
    if (!inputRef.current) {
      return;
    }

    // save current state
    const { value, selectionStart, selectionEnd } = inputRef.current;

    recordChange({
      value,
      selectionStart,
      selectionEnd,
    });
  }, [inputRef, recordChange]);

  return (
    <div {...divProps} style={{ ...styles.container, ...style }}>
      <pre
        className={preClassName}
        aria-hidden="true"
        style={{ ...styles.editor, ...styles.highlight, ...contentStyle }}
        {...(typeof highlighted === 'string'
          ? { dangerouslySetInnerHTML: { __html: highlighted + '<br />' } }
          : { children: highlighted })}
      />
      <textarea
        ref={inputRef}
        style={{
          ...styles.editor,
          ...styles.textarea,
          ...contentStyle,
        }}
        className={
          className + (textareaClassName ? ` ${textareaClassName}` : '')
        }
        id={textareaId}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onClick={onClick}
        onKeyUp={onKeyUp}
        onFocus={onFocus}
        onBlur={onBlur}
        disabled={disabled}
        form={form}
        maxLength={maxLength}
        minLength={minLength}
        name={name}
        placeholder={placeholder}
        readOnly={readOnly}
        required={required}
        autoFocus={autoFocus}
        autoCapitalize="off"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        data-gramm={false}
      />
      {/* eslint-disable-next-line react/no-danger */}
      <style dangerouslySetInnerHTML={{ __html: cssText }} />
    </div>
  );
}

const styles = {
  container: {
    position: 'relative',
    textAlign: 'left',
    boxSizing: 'border-box',
    padding: 0,
    overflow: 'hidden',
  },
  textarea: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    width: '100%',
    resize: 'none',
    color: 'inherit',
    overflow: 'hidden',
    MozOsxFontSmoothing: 'grayscale',
    WebkitFontSmoothing: 'antialiased',
    WebkitTextFillColor: 'transparent',
  },
  highlight: {
    position: 'relative',
    pointerEvents: 'none',
  },
  editor: {
    margin: 0,
    border: 0,
    background: 'none',
    boxSizing: 'inherit',
    display: 'inherit',
    fontFamily: 'inherit',
    fontSize: 'inherit',
    fontStyle: 'inherit',
    fontVariantLigatures: 'inherit',
    fontWeight: 'inherit',
    letterSpacing: 'inherit',
    lineHeight: 'inherit',
    tabSize: 'inherit',
    textIndent: 'inherit',
    textRendering: 'inherit',
    textTransform: 'inherit',
    whiteSpace: 'pre-wrap',
    wordBreak: 'keep-all',
    overflowWrap: 'break-word',
  },
} as const;
