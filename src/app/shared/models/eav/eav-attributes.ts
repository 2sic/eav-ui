import { EavAttribute } from './eav-attribute';
import { EavValue } from './eav-value';
import { Attributes1 } from '../json-format-v1/attributes1';

export class EavAttributes {
    string?: EavAttribute<string>;
    boolean?: EavAttribute<boolean>;

    constructor(string?: EavAttribute<string>, boolean?: EavAttribute<boolean>) {
        this.string = string;
        this.boolean = boolean;
    }

    /**
     * Create Eav Attributes model from json typed Attributes1
     * @param attributes1
     */
    public static create(attributes1: Attributes1): EavAttributes {
        return new EavAttributes(
            EavAttribute.create<string>(attributes1.String),
            EavAttribute.create<boolean>(attributes1.Boolean)
        );
    }

    /**
     * Create Eav Attributes model from json typed Attributes1
     * @param attributes1
     */
    // TODO: rewrite better
    /* public static create(attributes1: Attributes1): EavAttributes {
        let newEavAtributeString: EavAttribute<string>;
        let newEavAtributeBoolean: EavAttribute<boolean>;
        // TODO: others types
        // Loop trough attributes types - String, Boolean
        Object.keys(attributes1).forEach(attributes1Key => {
            if (attributes1.hasOwnProperty(attributes1Key)) {
                const attribute = attributes1[attributes1Key];
                // Creates new EavAttribute for specified type
                if (attributes1Key === 'String') {
                    newEavAtributeString = new EavAttribute<string>();
                }
                if (attributes1Key === 'Boolean') {
                    newEavAtributeBoolean = new EavAttribute<boolean>();
                }
                // Loop trough attribute - Description, Name ...
                Object.keys(attribute).forEach(attributeKey => {
                    if (attribute.hasOwnProperty(attributeKey)) {
                        const value = attribute[attributeKey];
                        // Creates new EavValue for specified type
                        if (attributes1Key === 'String') {
                            newEavAtributeString[attributeKey] = new EavValue<string>('*', value['*']); // TODO: maybe lower case key???
                        }
                        if (attributes1Key === 'Boolean') {
                            newEavAtributeBoolean[attributeKey] = new EavValue<boolean>('*', value['*']);
                        }
                        // TODO: others types - maybe switch
                    }
                }
                );
            }
        });

        return new EavAttributes(newEavAtributeString, newEavAtributeBoolean);
    } */
}
