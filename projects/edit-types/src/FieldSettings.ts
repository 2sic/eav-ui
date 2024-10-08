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
 * @All - Configuration fields which every input field has.
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
}

/**
 * @String - for compatibility only.
 * ATM not used as it's normally empty, but old configs still have this value set.
 */
interface FieldSettingsString extends All {
  /** Old input type for strings - was before the input type moved to '@All' so it must be preserved for all the old configs */
  InputType: string;
}

/**
 * @string-default
 */
export interface FieldSettingsStringDefault extends FieldSettingsString {
  InputFontFamily: '' | 'monospace';
  RowCount: number;
  TextWrapping: '' | 'pre';
}

/**
 * @string-dropdown
 */
export interface StringDropdown extends FieldSettingsString, FieldSettingsOptionsWip {
  /** Configured Values for dropdown. Only used to load the initial possible options. Not used in controls. */
  DropdownValues: string;
  /** Configured Value-format for dropdown. Only used to load the initial possible options. Not used in controls. */
  DropdownValuesFormat: '' | 'value-label';
  EnableTextEntry: boolean;
  // _options: PickerOptionCustom[];
}

export interface FieldSettingsOptionsWip {
  _options: PickerOptionCustom[];
}

/**
 * @string-url-path
 */
export interface StringUrlPath extends FieldSettingsString {
  AutoGenerateMask: string;
  AllowSlashes: boolean;
}

/**
 * @string-template-picker
 * New in 12.02
 */
export interface StringTemplatePicker extends FieldSettingsString {
  /** Contains the extension for which the file picker should filter. If not set, use preset mechanisms */
  FileType: string;
}

/**
 * @string-wysiwyg
 */
export interface StringWysiwyg extends FieldSettingsString {
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

export interface FieldSettingsPickerMasks {
  Value: string;
  /** Label to show or field-mask for label */
  Label: string;

  /** Additional fields which may not be directly used by a mask, but should be available for further use like in Formulas */
  MoreFields: string;
}

export interface FieldSettingsPickerStringList {
  Separator: string;
}

/**
 * @string-dropdown-query
 */
export interface StringDropdownQuery extends FieldSettingsString, FieldSettingsPickerWithQuery, FieldSettingsPickerMasks, FieldSettingsPickerStringList {
  EnableTextEntry: boolean;
  EnableEdit: boolean;
  EnableRemove: boolean;
  MoreFields: string;
}


/**
 * @string-font-icon-picker
 */
export interface StringFontIconPicker extends FieldSettingsString {
  CssPrefix: string;
  PreviewCss: string;
  Files: string;
  ShowPrefix?: boolean;
}

/**
 * @Number
 */
export interface FieldSettingsNumber extends All {
  Decimals: number;
  Min: number;
  Max: number;
  AddressMask: string;
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

export interface FieldSettingsPickerCreate {
  CreateTypes: string;
  EnableCreate: boolean;
}

export interface FieldSettingsEntityList {
  EnableEdit: boolean;
  EnableDelete: boolean;
}

// interface FieldSettings
/**
 * @Entity field configuration
 */
export interface FieldSettingsEntity extends All {
  EntityType: string;
  // TODO: REMOVE
  // AllowMultiValue: boolean;
  // EnableAddExisting: boolean;
  // EnableRemove: boolean;
}

export interface FieldSettingsPickerWithQuery {
  Query: string;
  StreamName: string;
  UrlParameters: string;
}

/**
 * @entity-query field configuration
 */
export interface EntityQuery extends
  FieldSettingsEntity,
  FieldSettingsEntityList,
  FieldSettingsPickerWithQuery { }

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
export interface FieldSettingsDateTime extends All {
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
}

/**
 * @Boolean
 */
export interface FieldSettingsBoolean extends All {
  TitleTrue: string;
  TitleFalse: string;
  TitleIndeterminate: string;
  ReverseToggle?: boolean;
  /** Label for Boolean fields */
  _label: string;
}

export interface FieldSettingsPicker {
  PickerDisplayMode: 'list' | 'tree' | 'checkbox' | 'radio' | 'auto-inline';
  PickerDisplayConfiguration: string[]; //can only be one entity guid
  PickerTreeConfiguration: UiPickerModeTree;

  EnableTextEntry: boolean;
  EnableReselect: boolean;

  /** Allow selecting multiple values */
  AllowMultiValue: boolean;
  /** If multi-value is allowed, specify a minimum */
  AllowMultiMin: number;
  /** If multi-value is allowed, specify a maximum */
  AllowMultiMax: number;

  /** Allow selecting existing data. This is false, if the data should only be created and used on a single fields. */
  EnableAddExisting: boolean;

  /** Allow removing previously selected items. Not quite sure what the consequence would be if false, should research/document */
  EnableRemove: boolean;

  DataSources: string[];

  DataSourceType: Of<typeof PickerConfigs>;
}

export interface FieldSettingsPickerMerged extends
  FieldSettingsPicker,
  FieldSettingsEntity,
  FieldSettingsEntityList,
  FieldSettingsPickerMasks,
  FieldSettingsPickerCreate,
  FieldSettingsPickerWithQuery,
  FieldSettingsPickerStringList,
  FieldSettingsOptionsWip
   { }


// interface EntityPicker extends EntityQuery, FieldSettingsPicker { }

// interface StringPicker extends StringDropdown, FieldSettingsPicker { }

/**
 * The Field Settings which every field has, containing `@All` and `@InternalSettings`.
 */
export interface FieldSettings extends
  All,
  InternalSettings { }

