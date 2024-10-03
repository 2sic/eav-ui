import { AbstractControl } from '@angular/forms';
import { Of } from '../../../../../../core';
import { FieldValue } from '../../../../../../edit-types/src/FieldValue';
import { InputTypeCatalog } from '../../../shared/fields/input-type-catalog';
import { FieldProps } from '../../state/fields-configs.model';

export interface FieldInitSpecs {
  name: string;
  props: FieldProps;
  inputType: Of<typeof InputTypeCatalog>;
  value: FieldValue;
  hasControl: boolean;
  control: AbstractControl;
}
