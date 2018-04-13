import { FormControl } from '@angular/forms';
import { EavValue, EavAttributes } from '../models/eav';
import { EavValues } from '../models/eav/eav-values';

export class LocalizationHelper {

    /**
     * get translated value for currentLanguage,
     * if not exist return default language translation,
     * if default also not exist return first value
     * @param currentLanguage
     * @param defaultLanguage
     * @param attributeValues
     */
    public static translate(currentLanguage: string, defaultLanguage: string, attributeValues: EavValue<any>[]): string {
        const translations: EavValue<any>[] = attributeValues.filter(c => c.dimensions.find(f => f.value === currentLanguage));

        // if translation exist then return translation
        if (translations.length > 0) {
            return translations[0].value;
        } else {
            const translationsDefault: EavValue<any>[] = attributeValues.filter(c => c.dimensions.find(f => f.value === defaultLanguage));
            // if default language translation exist then return translation
            if (translationsDefault.length > 0) {
                return translationsDefault[0].value;
            } else {
                // else get first value
                return attributeValues[0].value;
            }

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


    public static updateAttributeValue(allAttributes: EavAttributes, attributeKey: string, newValue: any, existingLanguageKey: string,
        isReadOnly: boolean) {
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

    /**
     * Remove language
     * @param allAttributesValues
     * @param attributeKey
     * @param languageKey
     */
    public static removeAttributeDimension(allAttributes: EavAttributes, attributeKey: string, languageKey: string) {
        // copy attributes from item
        let eavAttributes: EavAttributes = new EavAttributes();
        const value: EavValue<any> = this.getAttributeValueTranslation(allAttributes[attributeKey], languageKey);
        let attribute: EavValues<any> = null;

        // if more dimension exist delete only dimension
        if (value && value.dimensions.length > 1) {
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
        if (value && value.dimensions.length === 1) {
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
