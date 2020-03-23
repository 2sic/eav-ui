import { EavAttributes } from '.';
import { EavValues } from './eav-values';

export class EavDimensions<T> {
  value: T;

  constructor(value: T) {
    this.value = value;
  }

  /** Get attribute dimensions for current language */
  public static getEavAttributeDimensionsForLanguage(
    attribute: EavAttributes,
    attributeKey: string,
    currentLanguage: string,
  ): EavDimensions<any>[] {
    const eavAttribute: EavValues<any> = attribute[attributeKey];
    const dimensions = eavAttribute.values.map(eavValue => eavValue.dimensions.find(d => d.value === currentLanguage));
    return dimensions;
  }
}
