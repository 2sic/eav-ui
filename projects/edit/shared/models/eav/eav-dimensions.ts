import { EavAttributes, EavValues } from '.';

export class EavDimensions<T> {
  constructor(public Value: T) { }

  /** Get attribute dimensions for current language */
  public static getEavAttributeDimensionsForLanguage(
    attribute: EavAttributes,
    attributeKey: string,
    currentLanguage: string,
  ): EavDimensions<any>[] {
    const eavAttribute: EavValues<any> = attribute[attributeKey];
    const dimensions = eavAttribute.Values.map(eavValue => eavValue.Dimensions.find(d => d.Value === currentLanguage));
    return dimensions;
  }
}
