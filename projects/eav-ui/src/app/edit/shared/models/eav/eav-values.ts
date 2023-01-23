import { EavValue } from '.';
import { EavValuesDto } from '../json-format-v1';

export class EavValues<T> {
  Values: EavValue<T>[];
  Type: string;

  static convert<T>(valueDto: EavValuesDto<T>, type: string): EavValues<T> {
    const values = EavValue.convert(valueDto);

    const eavValues: EavValues<T> = {
      Values: values,
      Type: type,
    };
    return eavValues;
  }
}
