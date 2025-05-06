import { EavFieldValue } from '.';
import { EavValuesDto } from '../json-format-v1';

export class EavField<T> {
  Values: EavFieldValue<T>[];
  Type: string;

  static dtoToEav<T>(valueDto: EavValuesDto<T>, type: string): EavField<T> {
    const values = EavFieldValue.dtoToEav(valueDto);
    return {
      Values: values,
      Type: type,
    } satisfies EavField<T>;
  }
}
