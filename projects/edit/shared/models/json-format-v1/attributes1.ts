import { Attribute1, Value1 } from '.';
import { EavAttributes } from '../eav';

export class Attributes1 {
  [attributeType: string]: Attribute1<any>;

  public static create(eavAttributes: EavAttributes): Attributes1 {
    const newAttribute1: Attributes1 = new Attributes1();

    Object.keys(eavAttributes).forEach(eavAttributeKey => {
      const type = eavAttributes[eavAttributeKey].Type;
      if (!newAttribute1[type]) { newAttribute1[type] = {}; }
      newAttribute1[type][eavAttributeKey] = Value1.create(eavAttributes[eavAttributeKey]);
    });
    return newAttribute1;
  }
}
