import { Of } from '../../core';
import { PickerConfigs } from '../../eav-ui/src/app/edit/fields/picker/constants/picker-config-model.constants';
import { FeatureNames } from '../../eav-ui/src/app/features/feature-names';
import { PickerOptionCustom } from './DropdownOption';
import { UiPickerModeTree } from './PickerModeTree';

//#region All and InternalSettings + final FieldSettings

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
 * The Field Settings which every field has, containing `@All` and `@InternalSettings`.
 */
export interface FieldSettings extends 
  All,
  InternalSettings { }

//#endregion

//#region Normal Strings (non-pickers)

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

//#endregion

//#region Hyperlink

/**
 * @Hyperlink
 */
export interface Hyperlink {
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

//#endregion

//#region Number Classic (without pickers)

/**
 * @Number
 */
export interface FieldSettingsNumber {
  Decimals: number;
  Min: number;
  Max: number;
  AddressMask: string;
  ValidationRegEx: string;
  ValidationRegExJavaScript: string;
}

//#endregion

//#region Empty

/**
 * @empty-default
 */
export interface EmptyDefault {
  /** @deprecated */
  DefaultCollapsed: boolean;
  /** DefaultCollapsed is copied to Collapsed and then deleted  */
  Collapsed: boolean;
}

// Note that empty-end / empty-message don't have additional fields

//#endregion

//#region DateTime

/**
 * @DateTime
 */
export interface FieldSettingsDateTime {
  UseTimePicker: boolean;
}

//#endregion

//#region Custom Fields

/**
 * @custom-json-editor
 */
export interface CustomJsonEditor {
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
export interface CustomGps {
  LatField: string;
  LongField: string;
  AddressMask: string;
}

//#endregion


//#region Boolean

/**
 * @Boolean
 */
export interface FieldSettingsBoolean {
  TitleTrue: string;
  TitleFalse: string;
  TitleIndeterminate: string;
  ReverseToggle?: boolean;
  /** Label for Boolean fields, calculated on the fly by the logic */
  _label: string;
}

//#endregion


//#region Picker Shared Field Sets

/**
 * WIP type to hold the _options.
 * They should be moved to the data-source (not the initialization logic),
 * but ATM they are also used in validators, which would not have access to these.
 * Must find a better way to fix this.
 */
export interface FieldSettingsOptionsWip {
  _options: PickerOptionCustom[];
}

export interface FieldSettingsPickerMasks {
  /** The value mask - typically empty or the name of a field to use. */
  Value: string;
  /** Label to show or field-mask for label */
  Label: string;

  /** Additional fields which may not be directly used by a mask, but should be available for further use like in Formulas */
  MoreFields: string;
}

/** Separator, shared by string-dropdown and string-picker */
export interface FieldSettingsSharedSeparator {
  Separator: string;
}

interface FieldSettingsSharedTextEntry {
}

export interface FieldSettingsSharedCreate {
  CreateTypes: string;
  EnableCreate: boolean;
}

interface FieldSettingsEntityList {
  EnableEdit: boolean;
  EnableDelete: boolean;
}

interface FieldSettingsSharedQuery {
  Query: string;
  StreamName: string;
  UrlParameters: string;
}

interface FieldSettingsPickerMulti {
  /** Allow selecting multiple values */
  AllowMultiValue: boolean;

  /** If multi-value is allowed, specify a minimum */
  AllowMultiMin: number;

  /** If multi-value is allowed, specify a maximum */
  AllowMultiMax: number;

  /** Enable to select a previously selected item - only used in the new pickers */
  EnableReselect: boolean;
}

interface FieldSettingsPickerOptions {
  /** Enable edit features on the options and selected items */
  EnableEdit: boolean;

  /** Allow delete of entities */
  EnableDelete: boolean;

  /** Allow selecting existing data. This is false, if the data should only be created and used on a single fields. */
  EnableAddExisting: boolean;

  /** Allow removing previously selected items. Not quite sure what the consequence would be if false, should research/document */
  EnableRemove: boolean;

  /** Allow manual entry of another value */
  EnableTextEntry: boolean;
}


//#endregion


/**
 * @string-dropdown
 */
export interface StringDropdown extends FieldSettingsOptionsWip, Pick<FieldSettingsPickerOptions, 'EnableTextEntry'> {
  /** Configured Values for dropdown. Only used to load the initial possible options. Not used in controls. */
  DropdownValues: string;
  /** Configured Value-format for dropdown. Only used to load the initial possible options. Not used in controls. */
  DropdownValuesFormat: '' | 'value-label';
}


/**
 * @string-dropdown-query
 */
export interface StringDropdownQuery extends
  FieldSettingsSharedQuery,                           // Three fields from here
  Pick<FieldSettingsPickerMasks, 'Value' | 'Label'>,  // Two fields from here
  FieldSettingsSharedSeparator,
  Pick<FieldSettingsPickerOptions, 'EnableEdit' | 'EnableRemove' | 'EnableTextEntry'> { }


/**
 * @string-font-icon-picker
 */
export interface FieldSettingsStringFontIconPicker {
  CssPrefix: string;
  PreviewCss: string;
  Files: string;
  ShowPrefix?: boolean;
}


// interface FieldSettings
/**
 * @Entity field configuration
 */
export interface FieldSettingsEntity extends
  Pick<FieldSettingsPickerMulti, 'AllowMultiValue'>,
  Pick<FieldSettingsPickerOptions, 'EnableEdit' | 'EnableAddExisting' | 'EnableRemove' | 'EnableDelete'>,
  Pick<FieldSettingsSharedCreate, 'EnableCreate'> {
  
  /**
   * The entity-type to query and to use if create is enabled.
   * It's only available on the old content-type, as the picker setup has a different name for this (as it allows multiple types).
   */
  EntityType: string;

  /** Note: this exists as a hidden "beta" field and we'll remove it, but it could be in use in Swiss-School-System; check/fix that before we remove */
  // Prefill: string;
}


/**
 * @entity-query field configuration.
 * It just has the 3 fields of the shared query.
 */
export interface FieldSettingsEntityQuery extends FieldSettingsSharedQuery { }



export interface FieldSettingsPicker extends FieldSettingsPickerOptions, FieldSettingsPickerMulti {
  /**
   * List of DataSource Configurations.
   * ATM only one can be used, but the data model may some day support having more.
   */
  DataSources: string[];

  /**
   * The main type of the data source - based on the configuration which was selected
   * This is calculated, not a direct value from the configuration.
   */
  dataSourceType: Of<typeof PickerConfigs>;

  /**
   * How the picker should be displayed. `list` is the default / empty value.
   */
  PickerDisplayMode: 'list' | 'tree' | 'checkbox' | 'radio' | 'auto-inline';
  PickerDisplayConfiguration: string[]; //can only be one entity guid
  PickerTreeConfiguration: UiPickerModeTree;
}

export interface FieldSettingsPickerMerged extends
  FieldSettingsPicker,
  FieldSettingsEntity,
  FieldSettingsEntityList,
  FieldSettingsPickerMasks,
  FieldSettingsSharedCreate,
  FieldSettingsSharedQuery,
  FieldSettingsSharedSeparator,
  FieldSettingsOptionsWip
   { }


// interface EntityPicker extends EntityQuery, FieldSettingsPicker { }

// interface StringPicker extends StringDropdown, FieldSettingsPicker { }

