import { EavDimension } from '.';
import { EavValuesDto } from '../json-format-v1';

export class EavFieldValue<T> {
  value: T;
  dimensions: EavDimension[];

  static create<T>(value: T, dimensions: EavDimension[]): EavFieldValue<T> {
    return { value, dimensions } satisfies EavFieldValue<T>;
  }

  static dtoToEav<T>(valuesDto: EavValuesDto<T>): EavFieldValue<T>[] {
    const values = Object.entries(valuesDto)
      .map(([langs, value]) => {
        const dimensions = langs.split(',').map(lang => EavDimension.create(lang));
        return this.create(value, dimensions);
      });
    return values;
  }
}
