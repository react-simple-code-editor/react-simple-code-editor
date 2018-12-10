declare module 'react-simple-code-editor' {
  import * as React from 'react';

  export default class extends React.Component<
    React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLDivElement>,
      HTMLDivElement
    > & {
      // Props for the component
      value: string;
      onValueChange: (value: string) => unknown;
      highlight: (value: string) => string | React.ReactNode;
      tabSize?: number;
      insertSpaces?: boolean;
      ignoreTabKey?: boolean;
      padding?: number | string;
      style?: object;

      // Props for the textarea
      autoFocus?: boolean;
      disabled?: boolean;
      form?: string;
      maxLength?: number;
      minLength?: number;
      name?: string;
      placeholder?: string;
      readOnly?: boolean;
      required?: boolean;
      onFocus?: (e: React.FocusEvent<HTMLTextAreaElement>) => unknown;
      onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => unknown;
    }
  > {
    session: {
      history: {
        stack: Array<{
          value: string;
          selectionStart: number;
          selectionEnd: number;
          timestamp: number;
        }>;
        offset: number;
      };
    };
  }
}
