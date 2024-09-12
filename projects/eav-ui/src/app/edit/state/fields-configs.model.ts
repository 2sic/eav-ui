import { FieldSettings, FieldValue, PickerItem } from '../../../../../edit-types';
import { InputTypeMetadata } from '../../shared/fields/input-type-metadata.model';
import { FieldLogicBase } from '../fields/logic/field-logic-base';
import { TranslationState } from '../localization/translate-state.model';
import { FormulaFieldValidation } from '../formulas/targets/formula-targets';
import { InputTypeSpecs } from '../shared/input-types/input-type-specs.model';
import { PickerData } from '../fields/picker/picker-data';

export interface FieldProps {
  /** The language which applied to these field props as added to cache */
  language: string;
  constants: FieldConstants;
  settings: FieldSettings;
  translationState: TranslationState;

  /** INITIAL Value of this field - eg. at form-load or language change. */
  buildValue: FieldValue;
  buildWrappers: string[];
  formulaValidation: FormulaFieldValidation;

  pickerOptions: PickerItem[];
  pickerVersion: number | null;
  pickerSelectedVerBefore: number | null;
}

/** Field Config information which never changes through the entire lifetime in the UI */
export interface FieldConstants {
  /** The GUID it belongs to - must always be provided */
  entityGuid: string;

  /** The EntityId is used in field masks (for placeholders and for certain delete operations) */
  entityId: number;
  contentTypeNameId: string;

  /** The field name - always required */
  fieldName: string;
  index: number;

  dropzonePreviewsClass?: string;
  initialDisabled?: boolean;
  inputTypeSpecs: InputTypeSpecs;
  isLastInGroup?: boolean;
  type: string;
  logic?: FieldLogicBase,

  pickerData: () => PickerData | null;
}

/** Extended field config information which is constant as long as the language doesn't change. */
export interface FieldConstantsOfLanguage extends FieldConstants {
  /** The language used for the current "constants" */
  language: string,

  /** The initial field settings in this language */
  settingsInitial: FieldSettings,

  /** The input type configuration of this language */
  inputTypeConfiguration: InputTypeMetadata,
}



