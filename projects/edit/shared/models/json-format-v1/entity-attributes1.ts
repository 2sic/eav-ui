import { EntityAttribute1, Value1 } from '.';
import { EavEntityAttributes } from '../eav';

export class EntityAttributes1 {
  [attributeType: string]: EntityAttribute1<any>;

  public static convert(attributes: EavEntityAttributes): EntityAttributes1 {
    const attributes1: EntityAttributes1 = {};

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
