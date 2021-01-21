import { EavValue } from '.';
import { Value1 } from '../json-format-v1';

export class EavValues<T> {
  constructor(
    public Values: EavValue<T>[],
    public Type: string,
  ) { }

  public static create<T>(value1: Value1<T>, type: string): EavValues<T> {
    return new EavValues<T>(EavValue.create(value1), type);
  }
}
