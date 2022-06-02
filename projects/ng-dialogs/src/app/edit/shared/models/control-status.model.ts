import { FieldValue } from '../../../../../../edit-types';

export interface ControlStatus<T = FieldValue> {
  dirty: boolean;
  disabled: boolean;
  invalid: boolean;
  touched: boolean;
  value: T;
}
