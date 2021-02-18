import { ValidatorFn } from '@angular/forms';
import { FieldSettings } from '../../../edit-types';
import { FieldValue } from '../../eav-item-dialog/item-edit-form/item-edit-form.models';
import { CalculatedInputType } from './calculated-input-type.model';

export interface FieldsProps {
  [attributeName: string]: FieldProps;
}

export interface FieldProps {
  settings: FieldSettings;
  validators: ValidatorFn[];
  /** empty-default value is null */
  value: FieldValue;
  wrappers: string[];
  calculatedInputType: CalculatedInputType;
  constants: FieldConstants;
}

export interface FieldConstants {
  contentTypeId?: string;
  entityGuid?: string;
  entityId?: number;
  fieldName?: string;
  index?: number;
  inputType?: string;
  isExternal?: boolean;
  isLastInGroup?: boolean;
  angularAssets?: string;
  initialDisabled?: boolean;
}
