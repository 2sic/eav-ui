import { EavValues } from '../eav';

/**
 * A JSON representation of EavValues.
 * The keys are a string containing a CSV list of assigned dimensions, the values are the values.
 * This is a DTO (Data Transfer Object).
 */
export class EavValuesDto<T> {
  [languages: string]: T;

  static valuesToDto<T>(eavValues: EavValues<T>): EavValuesDto<T> {
    const dtoValue: EavValuesDto<T> = {};
    for (const value of eavValues.Values) {
      const dimensions = value.Dimensions.map(dimension => dimension.Value).join();
      dtoValue[dimensions] = value.Value;
    }
    return dtoValue;
  }
}
