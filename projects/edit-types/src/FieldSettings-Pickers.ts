import { Of } from '../../core/type-utilities';
import { PickerConfigs } from '../../eav-ui/src/app/edit/fields/picker/constants/picker-config-model.constants';
import { PickerOptionCustom } from './DropdownOption';
import { UiPickerModeTree } from './PickerModeTree';




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

export interface FieldSettingsPickerMulti {
  /** Allow selecting multiple values */
  AllowMultiValue: boolean;

  /** If multi-value is allowed, specify a minimum */
  AllowMultiMin: number;

  /** If multi-value is allowed, specify a maximum */
  AllowMultiMax: number;

  /** Enable to select a previously selected item - only used in the new pickers */
  EnableReselect: boolean;
}

export interface FieldSettingsPickerOptions {
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


// interface EntityPicker extends EntityQuery, FieldSettingsPicker { }

// interface StringPicker extends StringDropdown, FieldSettingsPicker { }

