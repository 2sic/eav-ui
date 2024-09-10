import { AbstractControl } from '@angular/forms';
import { FieldValue } from 'projects/edit-types';
import { InputTypeStrict } from '../../../shared/fields/input-type-catalog';
import { FieldProps } from '../../state/fields-configs.model';

export interface FieldInitSpecs {
  name: string;
  props: FieldProps;
  inputType: InputTypeStrict;
  value: FieldValue;
  hasControl: boolean;
  control: AbstractControl<any, any>;
}
