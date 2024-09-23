import { AbstractControl } from '@angular/forms';
import { InputTypeStrict } from '../../../shared/fields/input-type-catalog';
import { FieldProps } from '../../state/fields-configs.model';
import { FieldValue } from '../../../../../../edit-types/src/FieldValue';

export interface FieldInitSpecs {
  name: string;
  props: FieldProps;
  inputType: InputTypeStrict;
  value: FieldValue;
  hasControl: boolean;
  control: AbstractControl;
}
