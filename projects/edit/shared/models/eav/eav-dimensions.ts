import { EavAttributes, EavValues } from '.';

export class EavDimension {
  constructor(public Value: string) { }

  /** Get attribute dimensions for current language */
  public static getEavAttributeDimensionsForLanguage(
    attribute: EavAttributes,
    attributeKey: string,
    currentLanguage: string,
  ): EavDimension[] {
    const eavAttribute: EavValues<any> = attribute[attributeKey];
    const dimensions = eavAttribute.Values.map(eavValue => eavValue.Dimensions.find(d => d.Value === currentLanguage));
    return dimensions;
  }
}
