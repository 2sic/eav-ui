import { EavDimension } from '.';
import { EavValuesDto } from '../json-format-v1';

export class EavValue<T> {
  Value: T;
  Dimensions: EavDimension[];

  static create<T>(value: T, dimensions: EavDimension[]): EavValue<T> {
    const eavValue: EavValue<T> = {
      Value: value,
      Dimensions: dimensions,
    };
    return eavValue;
  }

  static convert<T>(valuesDto: EavValuesDto<T>): EavValue<T>[] {
    const values = Object.entries(valuesDto).map(([langs, value]) => {
      const dimensions = langs.split(',').map(lang => EavDimension.create(lang));
      return this.create(value, dimensions);
    });
    return values;
  }
}
