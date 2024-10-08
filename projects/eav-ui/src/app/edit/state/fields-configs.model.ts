import { FieldSettings } from '../../../../../edit-types/src/FieldSettings';
import { FieldValue } from '../../../../../edit-types/src/FieldValue';
import { InputTypeMetadata } from '../../shared/fields/input-type-metadata.model';
import { FieldLogicBase } from '../fields/logic/field-logic-base';
import { PickerItem } from '../fields/picker/models/picker-item.model';
import { PickerData } from '../fields/picker/picker-data';
import { FormulaFieldValidation } from '../formulas/targets/formula-targets';
import { TranslationState } from '../localization/translate-state.model';
import { InputTypeSpecs } from '../shared/input-types/input-type-specs.model';

/**
 * Field properties of a picker.
 * Implemented as a class, so we can use new FieldPropsPicker();
 * and reliably get undefined values (not null) to spread objects.
 */
export class FieldPropsPicker {
  list: PickerItem[];
  ver: number | undefined;
}

export interface FieldProps {
  /** The language which applied to these field props as added to cache */
  language: string;
  constants: FieldConstants;
  settings: FieldSettings;
  translationState: TranslationState;

  /** INITIAL Value of this field - eg. at form-load or language change. */
  value: FieldValue;
  buildWrappers: string[];
  formulaValidation: FormulaFieldValidation;

  opts: FieldPropsPicker;
  sel: FieldPropsPicker;
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



