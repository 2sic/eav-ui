import { ValidatorFn } from '@angular/forms';
import { CalculatedInputType } from '.';
import { FieldSettings, FieldValue } from '../../../edit-types';
import { TranslationStateCore } from '../../eav-material-controls/localization/translate-menu/translate-menu.models';

export interface FieldsProps {
  [attributeName: string]: FieldProps;
}

export interface FieldProps {
  calculatedInputType: CalculatedInputType;
  constants: FieldConstants;
  settings: FieldSettings;
  translationState: TranslationState;
  validators: ValidatorFn[];
  /** empty-default value is null */
  value: FieldValue;
  wrappers: string[];
}

export interface FieldConstants {
  angularAssets?: string;
  contentTypeId?: string;
  entityGuid?: string;
  fieldName?: string;
  index?: number;
  initialDisabled?: boolean;
  inputType?: string;
  isExternal?: boolean;
  isLastInGroup?: boolean;
  type?: string;
}

export interface TranslationState extends TranslationStateCore {
  infoLabel: string;
  infoMessage: string;
}
