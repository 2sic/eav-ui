import { CalculatedInputType } from '.';
import { FieldSettings, FieldValue } from '../../../../../../edit-types';
import { InputTypeStrict } from '../../../content-type-fields/constants/input-type.constants';
import { InputType } from '../../../content-type-fields/models/input-type.model';
import { FieldLogicBase } from '../../form/shared/field-logic/field-logic-base';
import { TranslationStateCore } from '../../form/wrappers/localization-wrapper/translate-menu/translate-menu.models';
import { FormulaFieldValidation } from '../../formulas/models/formula.models';

export interface FieldsProps extends Record<string, FieldProps> { };

export interface FieldProps {
  /** The language which applied to these field props as added to cache */
  language: string;
  calculatedInputType: CalculatedInputType;
  constants: FieldConstants;
  settings: FieldSettings;
  translationState: TranslationState;
  /** empty-default value is null */
  value: FieldValue;
  wrappers: string[];
  formulaValidation: FormulaFieldValidation;
}

/** Field Config information which never changes through the entire lifetime in the UI */
export interface FieldConstants {
  /** The GUID it belongs to - must always be provided */
  entityGuid: string;
  entityId: number;
  contentTypeNameId: string;

  /** The field name - always required */
  fieldName: string;
  index: number;

  angularAssets?: string;
  dropzonePreviewsClass?: string;
  initialDisabled?: boolean;
  inputType: CalculatedInputType;
  inputTypeStrict: InputTypeStrict;
  isExternal?: boolean;
  isLastInGroup?: boolean;
  type: string;
  logic?: FieldLogicBase,
}

/** Extended field config information which is constant as long as the language doesn't change. */
export interface FieldConstantsOfLanguage extends FieldConstants {
  /** The language used for the current "constants" */
  language: string,
  /** The initial field settings in this language */
  settingsInitial: FieldSettings,

  /** The input type configuration of this language */
  inputTypeConfiguration: InputType,
}


export interface TranslationState extends TranslationStateCore {
  infoLabel: string;
  infoMessage: string;
}
