import { Of } from '../../core';
import { PickerConfigs } from '../../eav-ui/src/app/edit/fields/picker/constants/picker-config-model.constants';
import { FeatureNames } from '../../eav-ui/src/app/features/feature-names';
import { PickerOptionCustom } from './DropdownOption';
import { UiPickerModeTree } from './PickerModeTree';

/** */
interface InternalSettings {
  /** Ui is disabled for translation reasons - detected at runtime */
  uiDisabledInThisLanguage?: boolean;

  /**
   * This is set by calculations and does not come from the back end.
   * Reasons typically:
   * - Form is read-only
   * - Field is disabled because of translation
   * - Slot is empty (eg. not activate presentation)
   */
  uiDisabledForced: boolean;

  /** This is the combined calculation of forced disabled and configured disabled */
  uiDisabled: boolean;

  /**
   * The value is currently required.
   * This is calculated at runtime, often based on visibility etc.
   */
  valueRequired?: boolean;
}

/**
 * @All
 */
interface All {
  /**
   * Used as a label
   */
  Name: string;
  /** The input type such as 'string-default' or 'string-picker' */
  InputType: string;

  /** The default value to use if there is nothing in the field yet / new */
  DefaultValue: string;

  /** Placeholder message in the input box */
  Placeholder: string;

  /** Notes / help - usually underneath the field input */
  Notes: string;

  /** If the field is visible */
  Visible: boolean;

  /**
   * Information if this field was forcibly disabled.
   * TODO: explain why this would be the case.
   * new v16.01
   */
  VisibleDisabled: boolean;

  /** Required according to configuration */
  Required: boolean;

  /** Disabled according to configuration */
  Disabled: boolean;

  /** Translation is not allowed - eg. on fields which should never have a different value in another language. */
  DisableTranslation: boolean;

  /** Disable Auto-Translation - eg. because it would not make sense. */
  DisableAutoTranslation: boolean;
  ValidationRegExJavaScript: string;

  /** IDs of formulas */
  Formulas: string[];

  CustomJavaScript: string;

  /** Determines if this field really exists or not */
  IsEphemeral: boolean;

  /**
   * List of features required by this field.
   * Mainly for license warnings.
   * @internal - don't show in any docs
   */
  requiredFeatures: Of<typeof FeatureNames>[];

  /**
   * New marker to prevent auto-focus on dropdowns if they are the first field.
   * It's often null/undefined, but must be true if we want to prevent an auto-focus.
   */
  noAutoFocus?: boolean;
}

/**
 * @String
 */
interface String extends All {
  /** Old input type for strings - was before the input type moved to '@All' so it must be preserved for all the old configs */
  InputType: string;
}

/**
 * @string-default
 */
export interface StringDefault extends String {
  InputFontFamily: '' | 'monospace';
  RowCount: number;
  TextWrapping: '' | 'pre';
}

/**
 * @string-dropdown
 */
export interface StringDropdown extends String {
  /** Configured Values for dropdown. Only used to load the initial possible options. Not used in controls. */
  DropdownValues: string;
  /** Configured Value-format for dropdown. Only used to load the initial possible options. Not used in controls. */
  DropdownValuesFormat: '' | 'value-label';
  EnableTextEntry: boolean;
  _options: PickerOptionCustom[];
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
  // Label: string;
  UrlParameters: string;
  EnableTextEntry: boolean;
  EnableEdit: boolean;
  EnableRemove: boolean;
  // AllowMultiValue: boolean;
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
 * @Entity field configuration
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
   * Note 2024-10-03 2dm - I believe this was never implemented
   * but I can't be sure. There seems to be no type or reference to this, so I'll try to remove it for now.
   */
  // Prefill: string;

  MoreFields: string;
}

/**
 * @entity-query field configuration
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

interface PickerSettings {
  PickerDisplayMode: 'list' | 'tree' | 'checkbox' | 'radio' | 'auto-inline';
  PickerDisplayConfiguration: string[]; //can only be one entity guid
  PickerTreeConfiguration: UiPickerModeTree;

  EnableReselect: boolean;
  AllowMultiMin: number;
  AllowMultiMax: number;

  DataSources: string[];

  DataSourceType: Of<typeof PickerConfigs>;

  // TODO: THIS SHOULD NOT BE ON THIS CLASS
  /** Label to show or field-mask for label */
  Label: string;

}


interface EntityPicker extends EntityQuery, PickerSettings { }

interface StringPicker extends StringDropdown, PickerSettings { }

// Note: ATM this field settings is too big, it pretends to have all fields of all possible settings
// while in reality it's always a sub-set.
// We should gradually remove most special types from the main type and ensure it's
// retyped when specific settings are needed.
export interface FieldSettings extends
  Boolean,
  CustomGps,
  CustomJsonEditor,
  DateTime,
  EmptyDefault,
  Entity,
  EntityQuery,
  // Hyperlink,
  HyperlinkLibrary,
  Number,
  StringDefault,
  // StringDropdown,
  StringDropdownQuery,
  // StringFontIconPicker,
  // StringTemplatePicker,
  // StringUrlPath,
  // StringWysiwyg,
  EntityPicker,
  StringPicker,
  InternalSettings { }

