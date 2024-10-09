/**
 * @String - for compatibility only.
 * ATM not used as it's normally empty, but old configs still have this value set.
 */
interface FieldSettingsString {
  /** Old input type for strings - was before the input type moved to '@All' so it must be preserved for all the old configs */
  InputType: string;
}

/**
 * @string-default
 */
export interface FieldSettingsStringDefault {
  /** The font to use; default is normal, monospace means Courier-New */
  InputFontFamily: '' | 'monospace';

  /**
   * Amount of rows to show.
   * * if null, 0 or 1 will use single-line.
   * -1 is a special multi-line which is only 1 line tall at first (new v18.02 and not released, but used in the old icon-font-picker)
   */
  RowCount: number;

  /** How text should wrap. For CSV it is usually pre, so it doesn't wrap till you have an enter */
  TextWrapping: '' | 'pre';
}


/**
 * @string-url-path
 */
export interface StringUrlPath {
  AutoGenerateMask: string;
  AllowSlashes: boolean;
}

/**
 * @string-template-picker
 * New in 12.02
 * This is kind of a picker, but it has 2 requirements
 * 1. select a file from a list of files (this could be done now with an App-Assets picker)
 * 2. open a dialog to create a new file (currently not supported in the generic pickers, maybe changed some day)
 */
export interface StringTemplatePicker {
  /** Contains the extension for which the file picker should filter. If not set, use preset mechanisms */
  FileType: string;
}

/**
 * @string-wysiwyg
 */
export interface StringWysiwyg {
  Dialog: '' | 'dialog' | 'inline';
  ButtonSource: "" | "true" | "false";
  ButtonAdvanced: "" | "true" | "false";
  /**
   * CSS file to be used for content styling. New in 11.03. Must be a real path to work, not file:xx
   */
  ContentCss: string;
  InlineInitialHeight: string;

  /** Reference to a external configuration */
  WysiwygConfiguration: string; // new v15


  /**
   * New for v15 - advanced settings which actually come from another entity
   */
  _advanced: {
    /** The initial mode, like 'default' or 'text' */
    Mode: 'default' | 'text' | 'rich';
    Json: string;
  };
  _allowDialog: boolean;
}

