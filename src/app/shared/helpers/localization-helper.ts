import { FormControl } from '@angular/forms';
import { EavValue, EavAttributes, Item } from '../models/eav';
import { EavValues } from '../models/eav/eav-values';
import { EavDimensions } from '../models/eav/eav-dimensions';

export class LocalizationHelper {

    // public static updateItemAttribute(item: Item, attributes: EavAttributes) {
    //     return {
    //         ...item,
    //         entity: {
    //             ...item.entity,
    //             attributes: attributes,
    //         }
    //     };
    // }


    /**
     * get translated value for currentLanguage,
     * if not exist return default language translation,
     * if default language also not exist return first value
     * @param currentLanguage
     * @param defaultLanguage
     * @param attributeValues
     */
    public static translate(currentLanguage: string, defaultLanguage: string, attributeValues: EavValues<any>, defaultValue: any): any {
        if (attributeValues) {
            const translations: EavValue<any>[] = attributeValues.values.filter(c =>
                c.dimensions.find(d =>
                    d.value === currentLanguage || d.value === `~${currentLanguage}`));

            // if translation exist then return translation
            if (translations.length > 0) {
                return translations[0].value;
            } else {
                const translationsDefault: EavValue<any>[] = attributeValues.values.filter(c =>
                    c.dimensions.find(d =>
                        d.value === defaultLanguage || d.value === `~${defaultLanguage}`));
                // if default language translation exist then return translation
                if (translationsDefault.length > 0) {
                    return translationsDefault[0].value;
                } else {
                    // else get first value
                    return attributeValues.values[0].value;
                }
            }
        } else {
            return defaultValue;
        }
    }

    public static getAttributeValueTranslation(allAttributesValues: EavValues<any>, languageKey: string): EavValue<any> {
        return allAttributesValues.values.find(eavValue =>
            eavValue.dimensions.find(d => d.value === languageKey || d.value === `~${languageKey}`) !== undefined);
    }

    public static isEditableOrReadonlyTranslationExist(allAttributesValues: EavValues<any>, languageKey: string): boolean {
        return allAttributesValues.values.filter(c =>
            c.dimensions.find(d =>
                d.value === languageKey || d.value === `~${languageKey}`)).length > 0;
    }

    public static isEditableTranslationExist(allAttributesValues: EavValues<any>, languageKey: string): boolean {
        return allAttributesValues.values.filter(eavValue =>
            eavValue.dimensions.find(d => d.value === languageKey)).length > 0;
    }

    public static isReadonlyTranslationExist(allAttributesValues: EavValues<any>, languageKey: string): boolean {
        return allAttributesValues.values.filter(eavValue =>
            eavValue.dimensions.find(d => d.value === `~${languageKey}`)).length > 0;
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

    /**
     * Update value for languageKey
     * @param allAttributes
     * @param updateValues
     * @param languageKey
     */
    public static updateAttributeValues(allAttributes: EavAttributes, updateValues: { [key: string]: any }, languageKey: string):
        EavAttributes {
        // copy attributes from item
        const eavAttributes: EavAttributes = new EavAttributes();
        console.log('saveAttributeValues attributes before ', allAttributes);
        Object.keys(allAttributes).forEach(attributeKey => {
            const newItemValue = updateValues[attributeKey];
            console.log('saveAttributeValues newItemValues ', newItemValue);
            // if new value exist update attribute for languageKey
            if (newItemValue !== null && newItemValue !== undefined) {
                const valueWithLanguageExist = this.isEditableOrReadonlyTranslationExist(allAttributes[attributeKey], languageKey);

                // if valueWithLanguageExist update value for languageKey
                if (valueWithLanguageExist) {
                    console.log('saveAttributeValues update values ', newItemValue);
                    eavAttributes[attributeKey] = {
                        ...allAttributes[attributeKey], values: allAttributes[attributeKey].values.map(eavValue => {
                            return eavValue.dimensions.find(d => d.value === languageKey || d.value === `~${languageKey}`)
                                // Update value for languageKey
                                ? {
                                    ...eavValue,
                                    value: newItemValue,
                                }
                                : eavValue;
                        })
                    };
                } else {
                    eavAttributes[attributeKey] = { ...allAttributes[attributeKey] };
                }
                // else { // else add new value with dimension languageKey
                //     console.log('saveAttributeValues add values ', newItemValue);
                //     const newEavValue = new EavValue(newItemValue, [new EavDimensions(languageKey)]);
                //     eavAttributes[attributeKey] = {
                //         ...allAttributes[attributeKey],
                //         values: [...allAttributes[attributeKey].values, newEavValue]
                //     };
                // }
            } else { // else copy item attributes
                console.log('saveAttributeValues update values else ', newItemValue);
                eavAttributes[attributeKey] = { ...allAttributes[attributeKey] };
            }
        });

        console.log('saveAttributeValues attributes after ', eavAttributes);

        return eavAttributes;
    }

    /**
     * update attribute value, and change language readonly state if needed
     * @param allAttributes
     * @param attributeKey
     * @param newValue
     * @param existingLanguageKey
     * @param isReadOnly
     */
    public static updateAttributeValue(allAttributes: EavAttributes, attributeKey: string, newValue: any, existingLanguageKey: string,
        isReadOnly: boolean): EavAttributes {
        // copy attributes from item
        let eavAttributes: EavAttributes = new EavAttributes();
        let newLanguageValue = existingLanguageKey;

        if (isReadOnly) {
            newLanguageValue = `~${existingLanguageKey}`;
        }

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

        eavAttributes = this.updateAttribute(allAttributes, attribute, attributeKey);

        return eavAttributes;
    }

    public static addAttributeValue(allAttributes: EavAttributes, attributeValue: EavValue<any>, attributeKey: string): EavAttributes {
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
     * Add dimension to value with existing dimension.
     * @param allAttributes
     * @param attributeKey
     * @param newValue
     * @param existingLanguageKey
     * @param isReadOnly
     */
    public static addAttributeDimension(allAttributes: EavAttributes, attributeKey: string, newDimensionValue: any,
        existingDimensionValue: string, isReadOnly: boolean): EavAttributes {
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
                        dimensions: eavValue.dimensions.concat({ value: newLanguageValue })
                    }
                    : eavValue;
            })
        };

        eavAttributes = this.updateAttribute(allAttributes, attribute, attributeKey);

        return eavAttributes;
    }

    /**
     * Remove language
     * if more dimension (languages) exist delete only dimension, else delete value and dimension
     * @param allAttributesValues
     * @param attributeKey
     * @param languageKey
     */
    public static removeAttributeDimension(allAttributes: EavAttributes, attributeKey: string, languageKey: string): EavAttributes {
        // copy attributes from item
        let eavAttributes: EavAttributes = new EavAttributes();
        const value: EavValue<any> = this.getAttributeValueTranslation(allAttributes[attributeKey], languageKey);
        let attribute: EavValues<any> = null;

        if (!value) {
            return { ...allAttributes };
        }

        // if more dimension exist delete only dimension
        if (value.dimensions.length > 1) {
            attribute = {
                ...allAttributes[attributeKey], values: allAttributes[attributeKey].values.map(eavValue => {
                    return eavValue.dimensions.find(d => d.value === languageKey || d.value === `~${languageKey}`)
                        ? {
                            ...eavValue,
                            // delete only dimension
                            dimensions: eavValue.dimensions.filter(dimension =>
                                (dimension.value !== languageKey && dimension.value !== `~${languageKey}`)
                            )
                        }
                        : eavValue;
                })
            };
        }
        // if only one dimension exist delete value and dimension
        if (value.dimensions.length === 1) {
            attribute = {
                // delete dimension and value
                ...allAttributes[attributeKey], values: allAttributes[attributeKey].values.filter(eavValue => {
                    return eavValue.dimensions.find(d => d.value !== languageKey && d.value !== `~${languageKey}`);
                })
            };
        }

        eavAttributes = this.updateAttribute(allAttributes, attribute, attributeKey);

        return eavAttributes;
    }
}
