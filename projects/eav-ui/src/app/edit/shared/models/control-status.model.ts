import { FieldValue } from '../../../../../../edit-types';

export interface ControlStatus<T = FieldValue> {
  dirty: boolean;
  disabled: boolean;
  invalid: boolean;
  touched: boolean;

  /** Combined info if modified and not valid, typically to then show red headings */
  touchedAndInvalid: boolean;
  value: T;
}
