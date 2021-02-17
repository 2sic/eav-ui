import { ValidatorFn } from '@angular/forms';
import { FieldSettings } from '../../../edit-types';
import { InputType } from '../../../ng-dialogs/src/app/content-type-fields/models/input-type.model';
import { FieldValue } from '../../eav-item-dialog/item-edit-form/item-edit-form.models';
import { CalculatedInputType } from './calculated-input-type.model';

export interface FieldsProps {
  [attributeName: string]: FieldProps;
}

export interface FieldProps {
  /** custom-default inputType is null */
  inputType: InputType;
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
}
