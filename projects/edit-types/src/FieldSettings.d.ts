import { DropdownOption } from './DropdownOption';

/**
 * @All
 */
interface All {
  /**
   * Used as a label
   */
  Name: string;
  InputType: string;
  DefaultValue: string;
  Placeholder: string;
  Notes: string;
  /** @deprecated */
  VisibleInEditUI: boolean;
  /** VisibleInEditUi is copied Visible and then deleted */
  Visible: boolean;
  Required: boolean;
  Disabled: boolean;
  DisableTranslation: boolean;
  ValidationRegExJavaScript: string;
  Formulas?: string[];
  CustomJavaScript: string;
}

/**
 * @String
 */
interface String extends All {
  DropdownValues: string;
  InputType: string;
}

/**
 * @string-default
 */
interface StringDefault extends String {
  RowCount: number;
}

/**
 * @string-dropdown
 */
interface StringDropdown extends String {
  DropdownValues: string;
  EnableTextEntry: boolean;
  _options: DropdownOption[];
}

/**
 * @string-url-path
 */
interface StringUrlPath extends String {
  AutoGenerateMask: string;
  AllowSlashes: boolean;
}

/**
 * @string-wysiwyg
 */
interface StringWysiwyg extends String {
  Dialog: "" | "dialog" | "inline";
  ButtonSource: "" | "true" | "false";
  ButtonAdvanced: "" | "true" | "false";
  /**
   * CSS file to be used for content styling. New in 11.03. Must be a real path to work, not file:xx
   */
  ContentCss: string;
}

/**
 * @string-dropdown-query
 */
interface StringDropdownQuery extends String {
  Query: string;
  StreamName: string;
  Value: string;
  Label: string;
  UrlParameters: string;
  EnableTextEntry: boolean;
  EnableEdit: boolean;
  EnableRemove: boolean;
  AllowMultiValue: boolean;
  Separator: string;
}

/**
 * @string-font-icon-picker
 */
interface StringFontIconPicker extends String {
  CssPrefix: string;
  PreviewCss: string;
  Files: string;
  ShowPrefix?: boolean;
}

/**
 * @Number
 */
interface Number extends All {
  Decimals: number;
  Min: number;
  Max: number;
  AddressMask: string;
  InputType: string;
  ValidationRegEx: string;
  ValidationRegExJavaScript: string;
}

/**
 * @Hyperlink
 */
interface Hyperlink extends All {
  FileFilter: string;
  /** @deprecated */
  DefaultDialog: string;
  ShowPagePicker: boolean;
  ShowImageManager: boolean;
  ShowFileManager: boolean;
  ShowAdam: boolean;
  Buttons: string;
  Paths: string;
  ServerResourceMapping: string;
}

/**
 * @hyperlink-library
 */
interface HyperlinkLibrary extends Hyperlink {
  FolderDepth: number;
  AllowAssetsInRoot: boolean;
  MetadataContentTypes: string;
}

/**
 * @Entity
 */
interface Entity extends All {
  EntityType: string;
  AllowMultiValue: boolean;
  EnableEdit: boolean;
  EnableCreate: boolean;
  EnableAddExisting: boolean;
  EnableRemove: boolean;
  EnableDelete: boolean;
  /**
   * Prefill values / mask - new in 11.11.03
   */
  Prefill: string;
}

/**
 * @entity-query
 */
interface EntityQuery extends Entity {
  Query: string;
  StreamName: string;
  UrlParameters: string;
}

/**
 * @empty-default
 */
interface EmptyDefault extends All {
  /** @deprecated */
  DefaultCollapsed: boolean;
  /** DefaultCollapsed is copied to Collapsed and then deleted  */
  Collapsed: boolean;
}

/**
 * @DateTime
 */
interface DateTime extends All {
  UseTimePicker: boolean;
}

/**
 * @custom-json-editor
 */
interface CustomJsonEditor extends All {
  Rows: number;
}

/**
 * @custom-gps
 */
interface CustomGps extends All {
  LatField: string;
  LongField: string;
  AddressMask: string;
  "Address Mask": string;
}

/**
 * @Boolean
 */
interface Boolean extends All {
  TitleTrue: string;
  TitleFalse: string;
  TitleIndeterminate: string;
  ReverseToggle?: boolean;
  /** Label for Boolean fields */
  _label: string;
}

export interface FieldSettings
  extends StringDefault,
  StringDropdown,
  StringUrlPath,
  StringWysiwyg,
  StringDropdownQuery,
  StringFontIconPicker,
  Number,
  Hyperlink,
  HyperlinkLibrary,
  Entity,
  EntityQuery,
  EmptyDefault,
  DateTime,
  CustomJsonEditor,
  CustomGps,
  Boolean { }
