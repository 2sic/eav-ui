export const InputTypeConstants = {
  // string
  StringDefault: 'string-default',
  StringUrlPath: 'string-url-path',
  StringDropdown: 'string-dropdown',
  StringDropdownQuery: 'string-dropdown-query',
  StringFontIconPicker: 'string-font-icon-picker',
  StringTemplatePicker: 'string-template-picker',
  StringWysiwyg: 'string-wysiwyg',
  // boolean
  BooleanDefault: 'boolean-default',
  BooleanTristate: 'boolean-tristate',
  // dateTime
  DatetimeDefault: 'datetime-default',
  // empty
  EmptyDefault: 'empty-default',
  EmptyEnd: 'empty-end',
  EmptyMessage: 'empty-message',
  // number
  NumberDefault: 'number-default',
  NumberDropdown: 'number-dropdown',
  // entity
  EntityDefault: 'entity-default',
  EntityQuery: 'entity-query',
  EntityContentBlocks: 'entity-content-blocks',
  // hyperlink
  HyperlinkDefault: 'hyperlink-default',
  HyperlinkLibrary: 'hyperlink-library',
  // custom
  ExternalWebComponent: 'external-web-component',
  CustomGPS: 'custom-gps',
  CustomJsonEditor: 'custom-json-editor',
  CustomDefault: 'custom-default',
  // old
  OldTypeDropdown: 'dropdown',
  OldTypeWysiwyg: 'wysiwyg',
  OldTypeDefault: 'default',
  StringWysiwygTinymce: 'string-wysiwyg-tinymce',
  StringWysiwygAdv: 'string-wysiwyg-adv',
  StringWysiwygDnn: 'string-wysiwyg-dnn',
  // default
  DefaultSuffix: '-default',
} as const;

export type InputTypeConstant = typeof InputTypeConstants[keyof typeof InputTypeConstants];
