export const InputTypeCatalog = {
  // Boolean
  BooleanDefault: 'boolean-default',
  BooleanTristate: 'boolean-tristate',

  // Custom
  CustomDefault: 'custom-default',
  CustomGps: 'custom-gps',
  CustomJsonEditor: 'custom-json-editor',

  // Date / Time
  DateTimeDefault: 'datetime-default',

  DefaultSuffix: '-default',

  // Empty
  EmptyDefault: 'empty-default',
  EmptyEnd: 'empty-end',
  EmptyMessage: 'empty-message',

  // Entity - all pickers
  EntityContentBlocks: 'entity-content-blocks',
  EntityDefault: 'entity-default',
  EntityQuery: 'entity-query',

  // External
  ExternalWebComponent: 'external-web-component',

  // Hyperlink / File
  HyperlinkDefault: 'hyperlink-default',
  HyperlinkLibrary: 'hyperlink-library',

  // Numbers
  NumberDefault: 'number-default',
  NumberDropdown: 'number-dropdown', // picker

  // String
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
