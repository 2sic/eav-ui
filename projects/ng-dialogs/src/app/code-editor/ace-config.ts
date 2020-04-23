import { AceConfigInterface } from 'ngx-ace-wrapper';

export const aceConfig: AceConfigInterface = {
  // readOnly?: boolean;
  // cursorStyle?: 'ace' | 'slim' | 'smooth' | 'wide';
  // selectionStyle?: 'line' | 'text';
  // mergeUndoDeltas?: boolean | 'always';
  // behavioursEnabled?: boolean;
  // highlightActiveLine?: boolean;
  // highlightSelectedWord?: boolean;
  // wrapBehavioursEnabled?: boolean;
  // copyWithEmptySelection?: boolean;
  // navigateWithinSoftTabs?: boolean;
  // autoScrollEditorIntoView?: boolean;
  // mode?: string;
  mode: 'razor',
  // wrap?: boolean;
  wrap: true,
  // tabSize?: number;
  // overwrite?: boolean;
  // useWorker?: boolean;
  // foldStyle?: string;
  // newLineMode?: string;
  // useSoftTabs?: boolean;
  useSoftTabs: true,
  // firstLineNumber?: number;
  theme: 'sqlserver',
  // minLines?: number;
  // maxLines?: number;
  // fontSize?: number | string;
  fontSize: 14,
  // fontFamily?: string;
  fontFamily: 'Consolas, Courier New, monospace',
  // showGutter?: boolean;
  showGutter: true,
  // printMargin?: number;
  // scrollPastEnd?: boolean;
  // animatedScroll?: boolean;
  // showInvisibles?: boolean;
  // fadeFoldWidgets?: boolean;
  // showFoldWidgets?: boolean;
  // showLineNumbers?: boolean;
  // showPrintMargin?: boolean;
  // fixedWidthGutter?: boolean;
  // printMarginColumn?: boolean;
  // displayIndentGuides?: boolean;
  // highlightGutterLine?: boolean;
  // hScrollBarAlwaysVisible?: boolean;
  // vScrollBarAlwaysVisible?: boolean;
  // dragDelay?: number;
  // dragEnabled?: boolean;
  // scrollSpeed?: number;
  // focusTimeout?: number;
  // tooltipFollowsMouse?: boolean;
  // enableBasicAutocompletion?: boolean;
  enableBasicAutocompletion: true,
  // enableLiveAutocompletion?: boolean;
  enableLiveAutocompletion: true,
  // enableSnippets?: boolean;
  enableSnippets: true,
  // enableEmmet?: boolean;
  // useElasticTabstops?: boolean;
};
