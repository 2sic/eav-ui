import { EavValue } from '.';
import { Value1 } from '../json-format-v1';

export class EavValues<T> {
  public Values: EavValue<T>[];
  public Type: string;

  public static convert<T>(value1: Value1<T>, type: string): EavValues<T> {
    const values: EavValues<T> = {
      Values: EavValue.create(value1),
      Type: type,
    };
    return values;
  }
}
