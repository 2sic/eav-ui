import { CalculatedInputType } from '.';
import { FieldSettings, FieldValue } from '../../../../../../edit-types';
import { InputTypeStrict } from '../../../content-type-fields/constants/input-type.constants';
import { TranslationStateCore } from '../../form/wrappers/localization-wrapper/translate-menu/translate-menu.models';
import { FormulaFieldValidation } from '../../formulas/models/formula.models';

export interface FieldsProps extends Record<string, FieldProps> { };

export interface FieldProps {
  calculatedInputType: CalculatedInputType;
  constants: FieldConstants;
  settings: FieldSettings;
  translationState: TranslationState;
  /** empty-default value is null */
  value: FieldValue;
  wrappers: string[];
  formulaValidation: FormulaFieldValidation;
  currentLanguage: string;
}

export interface FieldConstants {
  angularAssets?: string;
  contentTypeId?: string;
  dropzonePreviewsClass?: string;
  entityGuid?: string;
  entityId?: number;
  fieldName?: string;
  index?: number;
  initialDisabled?: boolean;
  inputType?: InputTypeStrict;
  isExternal?: boolean;
  isLastInGroup?: boolean;
  type?: string;
}

export interface TranslationState extends TranslationStateCore {
  infoLabel: string;
  infoMessage: string;
}
