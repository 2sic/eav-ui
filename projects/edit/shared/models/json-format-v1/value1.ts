import { EavValues } from '../eav';

export class Value1<T> {
  [languages: string]: T;

  static convert<T>(eavValues: EavValues<T>): Value1<T> {
    const value1: Value1<T> = {};
    for (const value of eavValues.Values) {
      const dimensions = value.Dimensions.map(dimension => dimension.Value).join();
      value1[dimensions] = value.Value;
    }
    return value1;
  }
}
