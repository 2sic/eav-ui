import { Attribute1 } from './attribute1';
import { EavAttributes } from '../eav';
import { Value1 } from './value1';

export class Attributes1 {
    String: Attribute1<string>;
    Boolean: Attribute1<boolean>;

    public static create<T>(eavAttributes: EavAttributes): Attributes1 {
        const newAttribute1: Attributes1 = new Attributes1();

        Object.keys(eavAttributes).forEach(eavAttributeKey => {
            if (eavAttributes.hasOwnProperty(eavAttributeKey)) {
                newAttribute1[eavAttributeKey] = Value1.create<T>(eavAttributes[eavAttributeKey]);
            }
        });
        return newAttribute1;
    }
}
