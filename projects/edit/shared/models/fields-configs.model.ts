import { ValidatorFn } from '@angular/forms';
import { FieldSettings } from '../../../edit-types';
import { InputType } from '../../../ng-dialogs/src/app/content-type-fields/models/input-type.model';

export interface FieldsProps {
  [attributeName: string]: FieldProps;
}

export interface FieldProps {
  inputType: InputType;
  settings: FieldSettings;
  validators: ValidatorFn[];
  wrappers: string[];
}
