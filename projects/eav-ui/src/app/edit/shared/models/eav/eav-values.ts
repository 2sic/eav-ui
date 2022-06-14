import { EavValue } from '.';
import { Value1 } from '../json-format-v1';

export class EavValues<T> {
  Values: EavValue<T>[];
  Type: string;

  static convert<T>(value1: Value1<T>, type: string): EavValues<T> {
    const values = EavValue.convert(value1);

    const eavValues: EavValues<T> = {
      Values: values,
      Type: type,
    };
    return eavValues;
  }
}
