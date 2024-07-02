declare module 'react-simple-code-editor' {
  import * as React from 'react';
  declare type Padding<T> =
    | T
    | {
        top?: T;
        right?: T;
        bottom?: T;
        left?: T;
      };
  declare type Record = {
    value: string;
    selectionStart: number;
    selectionEnd: number;
  };
  declare type History = {
    stack: (Record & {
      timestamp: number;
    })[];
    offset: number;
  };
  declare const Editor: React.ForwardRefExoticComponent<
    React.HTMLAttributes<HTMLDivElement> & {
      value: string;
      onValueChange: (value: string) => void;
      highlight: (value: string) => string | React.ReactNode;
      tabSize?: number | undefined;
      insertSpaces?: boolean | undefined;
      ignoreTabKey?: boolean | undefined;
      padding: Padding<number | string>;
      style?: React.CSSProperties | undefined;
      textareaId?: string | undefined;
      textareaClassName?: string | undefined;
      autoFocus?: boolean | undefined;
      disabled?: boolean | undefined;
      form?: string | undefined;
      maxLength?: number | undefined;
      minLength?: number | undefined;
      name?: string | undefined;
      placeholder?: string | undefined;
      readOnly?: boolean | undefined;
      required?: boolean | undefined;
      onClick?: React.MouseEventHandler<HTMLTextAreaElement> | undefined;
      onFocus?: React.FocusEventHandler<HTMLTextAreaElement> | undefined;
      onBlur?: React.FocusEventHandler<HTMLTextAreaElement> | undefined;
      onKeyUp?: React.KeyboardEventHandler<HTMLTextAreaElement> | undefined;
      onKeyDown?: React.KeyboardEventHandler<HTMLTextAreaElement> | undefined;
      preClassName?: string | undefined;
    } & React.RefAttributes<{
        session: {
          history: History;
        };
      }>
  >;
  export default Editor;
}
