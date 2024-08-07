export const InputTypeConstants = {
  BooleanDefault: 'boolean-default',
  BooleanTristate: 'boolean-tristate',
  CustomDefault: 'custom-default',
  CustomGps: 'custom-gps',
  CustomJsonEditor: 'custom-json-editor',
  DateTimeDefault: 'datetime-default',
  DefaultSuffix: '-default',
  EmptyDefault: 'empty-default',
  EmptyEnd: 'empty-end',
  EmptyMessage: 'empty-message',
  EntityContentBlocks: 'entity-content-blocks',
  EntityDefault: 'entity-default',
  EntityQuery: 'entity-query',
  ExternalWebComponent: 'external-web-component',
  HyperlinkDefault: 'hyperlink-default',
  HyperlinkLibrary: 'hyperlink-library',
  NumberDefault: 'number-default',
  NumberDropdown: 'number-dropdown',
  StringDefault: 'string-default',
  StringDropdown: 'string-dropdown',
  StringDropdownQuery: 'string-dropdown-query',
  StringFontIconPicker: 'string-font-icon-picker',
  StringJson: 'string-json',
  StringTemplatePicker: 'string-template-picker',
  StringUrlPath: 'string-url-path',
  StringWysiwyg: 'string-wysiwyg',

  /** New Pickers v17.x */
  EntityPicker: 'entity-picker',
  StringPicker: 'string-picker',
  NumberPicker: 'number-picker',
  
  /** for all situations where we need a fallback; new v16.04 */
  Unknown: 'unknown',
} as const;

export type InputTypeStrict = typeof InputTypeConstants[keyof typeof InputTypeConstants];
