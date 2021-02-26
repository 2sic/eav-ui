import { ValidatorFn } from '@angular/forms';
import { FieldSettings } from '../../../edit-types';
import { FieldValue } from '../../eav-item-dialog/item-edit-form/item-edit-form.models';
import { TranslationStateCore } from '../../eav-material-controls/localization/translate-menu/translate-menu.models';
import { CalculatedInputType } from './calculated-input-type.model';

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
  entityId?: number;
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
