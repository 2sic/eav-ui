import { Attribute1, Value1 } from '.';
import { EavAttributes } from '../eav';

export class Attributes1 {
  [attributeType: string]: Attribute1<any>;

  public static convert(attributes: EavAttributes): Attributes1 {
    const attributes1: Attributes1 = {};

    for (const [name, values] of Object.entries(attributes)) {
      const type = values.Type;
      if (attributes1[type] == null) {
        attributes1[type] = {};
      }
      attributes1[type][name] = Value1.convert(values);
    }
    return attributes1;
  }
}
