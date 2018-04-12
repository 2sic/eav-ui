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
            // First read all metadata settings witch are not @All
            eavEntityArray.forEach(eavEntity => {
                if (eavEntity.type.id !== '@All') {
                    Object.keys(eavEntity.attributes).forEach(attributeKey => {
                        newEavAtribute[attributeKey] = Object.assign({}, eavEntity.attributes[attributeKey]);
                    });
                }
            });
            // Read @All metadata settings last (to rewrite attribute if attribute with same name exist)
            eavEntityArray.forEach(eavEntity => {
                if (eavEntity.type.id === '@All') {
                    Object.keys(eavEntity.attributes).forEach(attributeKey => {
                        newEavAtribute[attributeKey] = Object.assign({}, eavEntity.attributes[attributeKey]);
                    });
                }
            });
        }
        return newEavAtribute;
    }

    /**
     * Create EavAtributes from dictionary
     */
    public static createFromDictionary = (value: { [key: string]: any }): EavAttributes => {
        const eavAttributes: EavAttributes = new EavAttributes();

        Object.keys(value).forEach(valueKey => {
            const eavValues: EavValue<any>[] = [];
            eavAttributes[valueKey] = new EavValues([new EavValue(value[valueKey], [])]);
        });

        return eavAttributes;
    }

    public static updateAttribute(allAttributes: EavAttributes, attribute: EavValues<any>, attributeKey: string) {
        // copy attributes from item
        const eavAttributes: EavAttributes = new EavAttributes();

        Object.keys(allAttributes).forEach(key => {
            // const eavValueList: EavValue<any>[] = [];
            if (key === attributeKey) {
                eavAttributes[key] = { ...attribute };
            } else {
                eavAttributes[key] = { ...allAttributes[key] };
            }
        });

        return eavAttributes;
    }


    public static updateAttributeValue(allAttributes: EavAttributes, attributeKey: string, newValue: any, existingLanguageKey: string,
        isReadOnly: boolean) {
        // copy attributes from item
        let eavAttributes: EavAttributes = new EavAttributes();
        let newLanguageValue = existingLanguageKey;

        if (isReadOnly) {
            newLanguageValue = `~${existingLanguageKey}`;
        }

        console.log('updateAttributeValue allAttributes:', allAttributes);
        console.log('updateAttributeValue attributeKey:', attributeKey);
        console.log('updateAttributeValue newValue:', newValue);
        console.log('updateAttributeValue existingLanguageKey:', existingLanguageKey);

        const attribute: EavValues<any> = {
            ...allAttributes[attributeKey], values: allAttributes[attributeKey].values.map(eavValue => {
                return eavValue.dimensions.find(d => d.value === existingLanguageKey || d.value === `~${existingLanguageKey}`)
                    // Update value and dimension
                    ? {
                        ...eavValue,
                        // update value
                        value: newValue,
                        // update languageKey with newLanguageValue
                        dimensions: eavValue.dimensions.map(dimension => {
                            return (dimension.value === existingLanguageKey || dimension.value === `~${existingLanguageKey}`)
                                ? { value: newLanguageValue }
                                : dimension;
                        })
                    }
                    : eavValue;
            })
        };

        console.log('dobio sam attrinute:', attribute);

        eavAttributes = this.updateAttribute(allAttributes, attribute, attributeKey);

        return eavAttributes;
    }

    public static addAttributeValue(allAttributes: EavAttributes, attributeValue: EavValue<any>, attributeKey: string) {
        // copy attributes from item
        let eavAttributes: EavAttributes = new EavAttributes();

        const attribute: EavValues<any> = {
            // Add attribute
            ...allAttributes[attributeKey], values: [...allAttributes[attributeKey].values, attributeValue]
        };

        eavAttributes = this.updateAttribute(allAttributes, attribute, attributeKey);

        return eavAttributes;
    }

    /**
     * Add dimension to value with existing dimension. Langulage can be set to be readonly or editable.
     * If we add editable dimension and readonly dimension exist then readonly dimension is overwritten (and vice versa)
     * If dimension value is readonly then we add (~) tilde
     * @param allAttributes
     * @param attributeKey
     * @param newValue
     * @param existingLanguageKey
     * @param isReadOnly
     */
    public static updateAttributeDimension(allAttributes: EavAttributes, attributeKey: string, newDimensionValue: any,
        existingDimensionValue: string, isReadOnly: boolean) {
        // copy attributes from item
        let eavAttributes: EavAttributes = new EavAttributes();
        let newLanguageValue = newDimensionValue;

        if (isReadOnly) {
            newLanguageValue = `~${newDimensionValue}`;
        }

        const attribute: EavValues<any> = {
            ...allAttributes[attributeKey], values: allAttributes[attributeKey].values.map(eavValue => {
                return eavValue.dimensions.find(d => d.value === existingDimensionValue)
                    // Update dimension for current language
                    ? {
                        ...eavValue,
                        // if languageKey already exist
                        dimensions: (eavValue.dimensions.find(d => d.value === newDimensionValue
                            || d.value === `~${newDimensionValue}`))
                            // update languageKey with newValue
                            ? eavValue.dimensions.map(dimension => {
                                return (dimension.value === newDimensionValue || dimension.value === `~${newDimensionValue}`)
                                    ? { value: newLanguageValue }
                                    : dimension;
                            })
                            // else add new dimension newValue
                            : eavValue.dimensions.concat({ value: newLanguageValue })
                    }
                    : eavValue;
            })
        };

        console.log('dobili smo attribute:', attribute);

        eavAttributes = this.updateAttribute(allAttributes, attribute, attributeKey);

        return eavAttributes;
    }

    public static getAttributeValueForLanguage(allAttributesValues: EavValues<any>, languageKey: string): EavValue<any> {
        return allAttributesValues.values.find(eavValue =>
            eavValue.dimensions.find(d => d.value === languageKey || d.value === `~${languageKey}`) !== undefined);
    }

    public static isAttributeValueForLanguageExist(allAttributesValues: EavValues<any>, languageKey: string): boolean {
        return allAttributesValues.values.filter(c =>
            c.dimensions.find(d =>
                d.value === languageKey || d.value === `~${languageKey}`)).length > 0;
    }

}
