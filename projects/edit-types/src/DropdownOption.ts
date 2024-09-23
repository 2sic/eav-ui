import { FieldValue } from './FieldValue';

export interface PickerOptionCustom {
  Title: string;
  Value: string | number;
}

export interface PickerOptionCustomExtended extends PickerOptionCustom, Record<string, FieldValue> {
}