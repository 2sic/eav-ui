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
  Visible: boolean;
  /** new v16.01 2dm - WIP */
  VisibleDisabled: boolean;
  Required: boolean;
  Disabled: boolean;
  ForcedDisabled: boolean;
  DisableTranslation: boolean;
  DisableAutoTranslation: boolean;
  ValidationRegExJavaScript: string;
  Formulas: string[];
  CustomJavaScript: string;
  /** Determines if this field really exists or not */
  IsEphemeral: boolean;
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
export interface StringDefault extends String {
  InputFontFamily: '' | 'monospace';
  RowCount: number;
}

/**
 * @string-dropdown
 */
export interface StringDropdown extends String {
  DropdownValues: string;
  DropdownValuesFormat: '' | 'value-label';
  EnableTextEntry: boolean;
  _options: DropdownOption[];
}

/**
 * @string-url-path
 */
export interface StringUrlPath extends String {
  AutoGenerateMask: string;
  AllowSlashes: boolean;
}

/**
 * @string-template-picker
 * New in 12.02
 */
export interface StringTemplatePicker extends String {
  /** Contains the extension for which the file picker should filter. If not set, use preset mechanisms */
  FileType: string;
}

// export const WysiwygDisplayModeDialogOnly = 'dialog';
// export const WysiwygDisplayModeInlineOnly = 'inline';
// export const WysiwygDisplayModeInlineWithDialog = '';
// export type WysiwygDisplayModes = typeof WysiwygDisplayModeDialogOnly | typeof WysiwygDisplayModeInlineOnly | typeof WysiwygDisplayModeInlineWithDialog; 

/**
 * @string-wysiwyg
 */
export interface StringWysiwyg extends String {
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

  _advanced: StringWysiwygAdvanced;
  _allowDialog: boolean;
}

/**
 * New for v15 - advanced settings which actually come from another entity
 */
export interface StringWysiwygAdvanced {
  /** The initial mode, like 'default' or 'text' */
  Mode: 'default' | 'text' | 'rich';
  Json: string;
}

/**
 * @string-dropdown-query
 */
export interface StringDropdownQuery extends String {
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
  MoreFields: string;
}

/**
 * @string-font-icon-picker
 */
export interface StringFontIconPicker extends String {
  CssPrefix: string;
  PreviewCss: string;
  Files: string;
  ShowPrefix?: boolean;
}

/**
 * @Number
 */
export interface Number extends All {
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
export interface Hyperlink extends All {
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
  EnableImageConfiguration: boolean;
}

/**
 * @hyperlink-library
 */
export interface HyperlinkLibrary extends Hyperlink {
  FolderDepth: number;
  AllowAssetsInRoot: boolean;
  MetadataContentTypes: string;
}

/**
 * @Entity
 */
export interface Entity extends All {
  EntityType: string;
  CreateTypes: string;
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

  MoreFields: string;
  Label: string;
}

/**
 * @entity-query
 */
export interface EntityQuery extends Entity {
  Query: string;
  StreamName: string;
  UrlParameters: string;
}

/**
 * @empty-default
 */
export interface EmptyDefault extends All {
  /** @deprecated */
  DefaultCollapsed: boolean;
  /** DefaultCollapsed is copied to Collapsed and then deleted  */
  Collapsed: boolean;
}

/**
 * @DateTime
 */
export interface DateTime extends All {
  UseTimePicker: boolean;
}

/**
 * @custom-json-editor
 */
export interface CustomJsonEditor extends All {
  Rows: number;
  JsonValidation: 'strict' | 'light' | 'none';
  JsonSchemaMode: 'strict' | 'light' | 'none';
  JsonSchemaSource: 'link' | 'raw';
  JsonSchemaUrl: string;
  JsonSchemaRaw: string;
  JsonCommentsAllowed: boolean;
}

/**
 * @custom-gps
 */
export interface CustomGps extends All {
  LatField: string;
  LongField: string;
  AddressMask: string;
  "Address Mask": string;
}

/**
 * @Boolean
 */
export interface Boolean extends All {
  TitleTrue: string;
  TitleFalse: string;
  TitleIndeterminate: string;
  ReverseToggle?: boolean;
  /** Label for Boolean fields */
  _label: string;
}

export interface EntityPicker extends EntityQuery {
  EnableReselect: boolean;
  AllowMultiMin: number;
  AllowMultiMax: number;

  DataSources: string[];
  UiPickerSourceQuery: UiPickerSourceQuery;

  PickerDisplayMode: 'list' | 'tree';
  PickerDisplayConfiguration: string[]; //can only be one entity guid
  PickerTreeConfiguration: UiPickerModeTree;

  ItemInformation: string;
  ItemTooltip: string;
  ItemLink: string;

  DataSourceType: 'UiPickerSourceCustomList' | 'UiPickerSourceQuery' | 'UiPickerSourceEntity';
}

export interface StringPicker extends StringDropdown {
  EnableReselect: boolean;
  AllowMultiMin: number;
  AllowMultiMax: number;

  DataSources: string[];
  UiPickerSourceQuery: UiPickerSourceQuery;

  PickerDisplayMode: 'list' | 'tree';
  PickerDisplayConfiguration: string[]; //can only be one entity guid
  PickerTreeConfiguration: UiPickerModeTree;

  DataSourceType: 'UiPickerSourceCustomList' | 'UiPickerSourceQuery' | 'UiPickerSourceEntity';
}

interface InternalSettings {
  _disabledBecauseOfTranslation?: boolean;
  _isDialog?: boolean;
  _currentRequired?: boolean;
}

export interface FieldSettings extends
  Boolean,
  CustomGps,
  CustomJsonEditor,
  DateTime,
  EmptyDefault,
  Entity,
  EntityQuery,
  Hyperlink,
  HyperlinkLibrary,
  Number,
  StringDefault,
  StringDropdown,
  StringDropdownQuery,
  StringFontIconPicker,
  StringTemplatePicker,
  StringUrlPath,
  StringWysiwyg,
  EntityPicker,
  StringPicker,
  InternalSettings { }

export interface UiPickerSourceCustomList extends ConfigModel {
  Values: string;
}

export interface UiPickerSourceQuery extends ConfigModel {
  Query: string;
  QueryParameters: string;
  StreamName: string;
  Value: string;
  Label: string;
  CreateTypes: string;
  MoreFields: string;
}

export const RelationshipParentChild = 'parent-child';
export const RelationshipChildParent = 'child-parent';

export interface UiPickerModeTree extends ConfigModel {
  TreeRelationship: typeof RelationshipParentChild | typeof RelationshipChildParent ; //child-parent or parent-child
  TreeBranchesStream: string;
  TreeLeavesStream: string;
  TreeParentIdField: string;
  TreeChildIdField: string;
  TreeParentChildRefField: string;
  TreeChildParentRefField: string;

  TreeShowRoot: boolean;
  TreeDepthMax: number;

  TreeAllowSelectRoot: boolean;
  TreeAllowSelectBranch: boolean;
  TreeAllowSelectLeaf: boolean;
}

export interface UiPickerSourceQuery extends UiPickerSourceEntityAndQuery {
  Query: string;
  QueryParameters: string;
  StreamName: string;
  Label: string;
  Value: string;
}

export interface UiPickerSourceEntity extends UiPickerSourceEntityAndQuery {
  ContentTypeNames: string;
}

export interface UiPickerSourceCustomList extends UiPickerSource {
  DropdownValues: string;
}

export interface UiPickerSourceEntityAndQuery extends UiPickerSource {
  CreateTypes: string;
  MoreFields: string;
}

interface UiPickerSource extends ConfigModel {
  /** Label or field-mask for label */
  Label: string;
  /** ItemInfo or field-mask for ItemInfo */
  ItemInformation: string;
  /** ItemTooltip or field-mask for ItemTooltip */
  ItemTooltip: string;
  /** ItemLink or field-mask for ItemLink */
  ItemLink: string;
}

interface ConfigModel {
  Title: string;

  ConfigModel: 'UiPickerSourceCustomList' | 'UiPickerSourceQuery' | 'UiPickerSourceEntity' | 'UiPickerModeTree';
}