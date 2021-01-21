import { EavAttributes } from '../eav';
import { Attribute1 } from './attribute1';
import { Value1 } from './value1';

export class Attributes1<T> {
  [key: string]: Attribute1<T>;

  public static create<T>(eavAttributes: EavAttributes): Attributes1<T> {
    const newAttribute1: Attributes1<T> = new Attributes1<T>();

    Object.keys(eavAttributes).forEach(eavAttributeKey => {
      const type = eavAttributes[eavAttributeKey].Type;
      if (!newAttribute1[type]) { newAttribute1[type] = {}; }
      newAttribute1[type][eavAttributeKey] = Value1.create<T>(eavAttributes[eavAttributeKey]);
    });
    return newAttribute1;
  }
}
