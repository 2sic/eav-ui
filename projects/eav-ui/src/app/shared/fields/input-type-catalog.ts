export const InputTypeCatalog = {
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
  EntityContentBlocks: 'entity-content-blocks', // picker
  EntityDefault: 'entity-default',  // picker
  EntityQuery: 'entity-query',  // picker
  ExternalWebComponent: 'external-web-component',
  HyperlinkDefault: 'hyperlink-default',
  HyperlinkLibrary: 'hyperlink-library',
  NumberDefault: 'number-default',
  NumberDropdown: 'number-dropdown', // picker
  StringDefault: 'string-default',
  StringDropdown: 'string-dropdown', // picker
  StringDropdownQuery: 'string-dropdown-query', // picker
  StringFontIconPicker: 'string-font-icon-picker',
  StringJson: 'string-json',
  StringTemplatePicker: 'string-template-picker', // picker
  StringUrlPath: 'string-url-path',
  StringWysiwyg: 'string-wysiwyg',

  /** New Pickers v17.x */
  EntityPicker: 'entity-picker',
  StringPicker: 'string-picker',
  NumberPicker: 'number-picker',

  /** for all situations where we need a fallback; new v16.04 */
  Unknown: 'unknown',
} as const;

export type InputTypeStrict = typeof InputTypeCatalog[keyof typeof InputTypeCatalog];
