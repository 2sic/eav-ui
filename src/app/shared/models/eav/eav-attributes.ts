import { EavValues } from './eav-values';
import { Attribute1 } from '../json-format-v1/attribute1';
import { Attributes1 } from '../json-format-v1/attributes1';
import { EavValue } from './eav-value';
import { EavEntity } from './eav-entity';

export class EavAttributes {
    [key: string]: EavValues<any>;

    /**
     * Create Eav Attributes from json typed Attributes1
     * @param attributes1
     */
    public static create<T>(attributes1: Attributes1): EavAttributes {
        const newEavAtribute: EavAttributes = new EavAttributes();

        // Loop trough attributes types - String, Boolean ...
        Object.keys(attributes1).forEach(attributes1Key => {
            if (attributes1.hasOwnProperty(attributes1Key)) {
                const attribute1 = attributes1[attributes1Key];
                // Loop trough attribute - Description, Name ...
                Object.keys(attribute1).forEach(attribute1Key => {
                    if (attribute1.hasOwnProperty(attribute1Key)) {
                        // Creates new EavValue for specified type
                        newEavAtribute[attribute1Key] = EavValues.create<T>(attribute1[attribute1Key]);
                    }
                });
            }
        });

        return newEavAtribute;
    }

    /**
     * Get all attributes (dictionary) from attributs in EavEntity array (all attributs from each entity in array)
     * Example: Settings from metadata array
     * @param entity1Array
     */
    public static getFromEavEntityArray(eavEntityArray: EavEntity[]): EavAttributes {
        const newEavAtribute: EavAttributes = new EavAttributes();
        if (eavEntityArray !== undefined) {
            eavEntityArray.forEach(eavEntity => {
                Object.keys(eavEntity.attributes).forEach(attributeKey => {
                    // TODO: Must see can attributs with same name exist
                    newEavAtribute[attributeKey] = Object.assign({}, eavEntity.attributes[attributeKey]);
                });
            });
        }
        return newEavAtribute;
    }
}

