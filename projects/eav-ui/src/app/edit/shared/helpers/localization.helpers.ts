import { FieldValue } from '../../../../../../edit-types';
import { consoleLogEditForm } from '../../../shared/helpers/console-log-angular.helper';
import { BestValueMode, BestValueModes } from '../constants';
import { FormValues } from '../models';
import { EavDimension, EavEntityAttributes, EavValue, EavValues } from '../models/eav';
import { FormLanguage } from '../models/form-languages.model';

export class LocalizationHelpers {
  /**
   * Get translated value for currentLanguage,
   * if not exist return default language translation,
   * if default language also not exist return first value
   */
  static translate<T>(language: FormLanguage, attributeValues: EavValues<T>, defaultValue: T): T | null {
    if (!attributeValues)
      return defaultValue;

    const translation: EavValue<T> = this.getValueTranslation(attributeValues, language);
    if (translation)
      return translation.Value;

    const translationDefault: EavValue<T> = this.getValueTranslation(attributeValues, FormLanguage.bothPrimary(language));
    if (translationDefault)
      return translationDefault.Value;

    // TODO: maybe return value with *
    return attributeValues.Values[0]?.Value ?? null;
  }

  static getValueOrDefault(allAttributesValues: EavValues<any>, language: FormLanguage): EavValue<any> {
    let translation = this.getValueTranslation(allAttributesValues, language);
    return translation
      ?? this.getValueTranslation(allAttributesValues, FormLanguage.bothPrimary(language));
  }

  static getValueTranslation<T>(allAttributesValues: EavValues<T>, language: FormLanguage): EavValue<T> {
    return allAttributesValues.Values.find(eavValue =>
      eavValue.Dimensions.find(d => d.Value === language.current
        || d.Value === `~${language.current}`
        || (language.current === language.primary && d.Value === '*')) !== undefined);
  }

  static isEditableOrReadonlyTranslationExist(allAttributesValues: EavValues<any>, language: FormLanguage): boolean {
    return allAttributesValues
      ? allAttributesValues.Values.filter(c => c.Dimensions.find(d =>
          d.Value === language.current
          || d.Value === `~${language.current}`
          || (language.current === language.primary && d.Value === '*'))
        ).length > 0
      : false;
  }

  /**
   * Values of a field are for the current language,
   * if they are assigned to the current language or to '*' (but only when the current-language is also the primary-language)
   */
  private static valuesOfCurrent<T>(field: EavValues<T>, langs: FormLanguage): EavValue<T>[] {
    if (!field) return [];
    return field.Values
      .filter(val => val.Dimensions.find(d => (d.Value === langs.current) || (d.Value === '*' && langs.current === langs.primary)));
  }


  /** A value in specified Language is editable, if assigned to current language or to '*' (but only when on default-language) */
  static hasEditableValue(field: EavValues<any>, language: FormLanguage): boolean {
    return this.valuesOfCurrent(field, language).length > 0;
  }

  // Number of editable translatable fields that
  static countEditableValues(field: EavValues<any>, language: FormLanguage): number {
    return this.valuesOfCurrent(field, language).length;
  }

  // Number of editable translatable fields that have some content
  static countEditableValuesWithContent(field: EavValues<any>, language: FormLanguage): number {
    if (!field) return 0;
    return this.valuesOfCurrent(field, language).filter(v => v.Value != "" && v.Value != null)?.length
  }

  static hasReadonlyValue(field: EavValues<any>, language: string): boolean {
    if (!field) return false;
    return field.Values.filter(val => val.Dimensions.find(d => d.Value === `~${language}`)).length > 0;
  }

  static hasValueOnPrimary(field: EavValues<any>, defaultLanguage: string): boolean {
    if (!field) return false;
    return field.Values.filter(val => val.Dimensions.find(d => d.Value === defaultLanguage || d.Value === '*')).length > 0;
  }

  /** Copy attributes from item */
  private static updateAttribute(
    oldAttributes: EavEntityAttributes,
    attributeKey: string,
    attribute: EavValues<any>,
  ): EavEntityAttributes {
    const newAttributes: EavEntityAttributes = {};
    if (Object.keys(oldAttributes).length === 0) {
      const attributeCopy: EavValues<any> = { ...attribute };
      newAttributes[attributeKey] = attributeCopy;
      return newAttributes;
    }

    for (const key of Object.keys(oldAttributes)) {
      if (key === attributeKey) {
        const attributeCopy: EavValues<any> = { ...attribute };
        newAttributes[key] = attributeCopy;
      } else {
        const attributeCopy: EavValues<any> = { ...oldAttributes[key] };
        newAttributes[key] = attributeCopy;
      }
    }

    if (oldAttributes[attributeKey] == null) {
      const attributeCopy: EavValues<any> = { ...attribute };
      newAttributes[attributeKey] = attributeCopy;
    }
    return newAttributes;
  }

  /** Update values for languageKey */
  static updateAttributesValues(
    allAttributes: EavEntityAttributes,
    updateValues: FormValues,
    language: FormLanguage,
  ): EavEntityAttributes {
    // copy attributes from item
    const eavAttributes: EavEntityAttributes = {};
    Object.keys(allAttributes).forEach(attributeKey => {
      const newItemValue = updateValues[attributeKey];
      // if new value exist update attribute for languageKey
      // if (newItemValue !== null && newItemValue !== undefined) {
      if (newItemValue !== undefined) {
        const valueWithLanguageExist = this.isEditableOrReadonlyTranslationExist(
          allAttributes[attributeKey], language);

        // if valueWithLanguageExist update value for languageKey
        if (valueWithLanguageExist) {
          const newValues: EavValues<any> = {
            ...allAttributes[attributeKey], Values: allAttributes[attributeKey].Values.map(eavValue => {
              const newValue: EavValue<any> = eavValue.Dimensions.find(d => d.Value === language.current
                || d.Value === `~${language.current}`
                || (language.current === language.primary && d.Value === '*'))
                // Update value for languageKey
                ? {
                  ...eavValue,
                  Value: newItemValue,
                }
                : eavValue;
              return newValue;
            })
          };
          eavAttributes[attributeKey] = newValues;
        } else { // else add new value with dimension languageKey
          consoleLogEditForm('saveAttributeValues add values ', newItemValue);
          const newEavValue = EavValue.create(newItemValue, [EavDimension.create(language.current)]);
          const newAttribute: EavValues<any> = {
            ...allAttributes[attributeKey],
            Values: [...allAttributes[attributeKey].Values, newEavValue]
          };
          eavAttributes[attributeKey] = newAttribute;
        }
      } else { // else copy item attributes
        const attributeCopy: EavValues<any> = { ...allAttributes[attributeKey] };
        eavAttributes[attributeKey] = attributeCopy;
      }
    });
    return eavAttributes;
  }

  /** update attribute value, and change language readonly state if needed */
  static updateAttributeValue(
    allAttributes: EavEntityAttributes,
    attributeKey: string,
    updateValue: FieldValue,
    existingLanguageKey: string,
    defaultLanguage: string,
    isReadOnly: boolean,
  ): EavEntityAttributes {
    // copy attributes from item
    let eavAttributes: EavEntityAttributes = {};
    let newLanguageValue = existingLanguageKey;

    if (isReadOnly)
      newLanguageValue = `~${existingLanguageKey}`;

    const attribute: EavValues<any> = {
      ...allAttributes[attributeKey], Values: allAttributes[attributeKey].Values.map(eavValue => {
        const newValue: EavValue<any> = eavValue.Dimensions.find(d => d.Value === existingLanguageKey
          || d.Value === `~${existingLanguageKey}`
          || (existingLanguageKey === defaultLanguage && d.Value === '*')
        )
          // Update value and dimension
          ? {
            ...eavValue,
            // update value
            Value: updateValue,
            // update languageKey with newLanguageValue
            Dimensions: eavValue.Dimensions.map(dimension => {
              const newDimensions: EavDimension = (dimension.Value === existingLanguageKey
                || dimension.Value === `~${existingLanguageKey}`
                || (existingLanguageKey === defaultLanguage && dimension.Value === '*'))
                ? { Value: newLanguageValue }
                : dimension;
              return newDimensions;
            })
          }
          : eavValue;
        return newValue;
      })
    };
    eavAttributes = this.updateAttribute(allAttributes, attributeKey, attribute);
    return eavAttributes;
  }

  static addAttributeValue(
    allAttributes: EavEntityAttributes,
    attributeValue: EavValue<any>,
    attributeKey: string,
    attributeType: string,
  ): EavEntityAttributes {
    // copy attributes from item
    let eavAttributes: EavEntityAttributes = {};
    const attribute: EavValues<any> =
      Object.keys(allAttributes).length === 0 || !allAttributes[attributeKey]
      ? {
          ...allAttributes[attributeKey],
          Values: [attributeValue],
          Type: attributeType
        }
      : {
          ...allAttributes[attributeKey],
          Values: [...allAttributes[attributeKey].Values, attributeValue],
          Type: attributeType
        };
    eavAttributes = this.updateAttribute(allAttributes, attributeKey, attribute);
    return eavAttributes;
  }

  /** Add dimension to value with existing dimension */
  static addAttributeDimension(
    allAttributes: EavEntityAttributes,
    attributeKey: string,
    newDimensionValue: string,
    existingDimensionValue: string,
    defaultLanguage: string,
    isReadOnly: boolean,
  ): EavEntityAttributes {
    // copy attributes from item
    let eavAttributes: EavEntityAttributes = {};
    let newLanguageValue = newDimensionValue;

    if (isReadOnly) {
      newLanguageValue = `~${newDimensionValue}`;
    }

    const attribute: EavValues<any> = {
      ...allAttributes[attributeKey], Values: allAttributes[attributeKey].Values.map(eavValue => {
        const newValue: EavValue<any> = eavValue.Dimensions.find(d => d.Value === existingDimensionValue
          || (existingDimensionValue === defaultLanguage && d.Value === '*'))
          // Update dimension for current language
          ? {
              ...eavValue,
              // if languageKey already exist
              Dimensions: eavValue.Dimensions.concat({ Value: newLanguageValue })
            }
          : eavValue;
        return newValue;
      })
    };
    eavAttributes = this.updateAttribute(allAttributes, attributeKey, attribute);
    return eavAttributes;
  }

  /** Removes dimension (language) from attribute. If multiple dimensions exist, delete only dimension, else delete value and dimension */
  static removeAttributeDimension(attributes: EavEntityAttributes, attributeKey: string, language: string): EavEntityAttributes {
    const oldAttributes = attributes;
    const validDimensions = [language, `~${language}`];

    const value = oldAttributes[attributeKey].Values.find(eavValue => {
      const dimensionExists = eavValue.Dimensions.some(dimension => validDimensions.includes(dimension.Value));
      return dimensionExists;
    });

    // given dimension doesn't exist for this attribute so no change is needed
    if (!value) {
      const attributesCopy: EavEntityAttributes = { ...oldAttributes };
      return attributesCopy;
    }

    let newAttribute: EavValues<any>;
    if (value.Dimensions.length > 1) {
      // if multiple dimensions exist delete only dimension
      newAttribute = {
        ...oldAttributes[attributeKey],
        Values: oldAttributes[attributeKey].Values.map(eavValue => {
          const dimensionExists = eavValue.Dimensions.some(dimension => validDimensions.includes(dimension.Value));
          if (!dimensionExists) return eavValue;

          return {
            ...eavValue,
            Dimensions: eavValue.Dimensions.filter(dimension => !validDimensions.includes(dimension.Value)),
          } satisfies EavValue<any>;
        })
      };
    } else if (value.Dimensions.length === 1) {
      // if only one dimension exists delete value and dimension
      newAttribute = {
        ...oldAttributes[attributeKey],
        Values: oldAttributes[attributeKey].Values.filter(eavValue => {
          const dimensionExists = eavValue.Dimensions.some(dimension => validDimensions.includes(dimension.Value));
          return !dimensionExists;
        })
      };
    }

    const newAttributes = this.updateAttribute(oldAttributes, attributeKey, newAttribute);
    return newAttributes;
  }

  /**
   * Default mode priority:
   * 1. value for current language
   * 2. value for all languages
   * 3. value for default language
   * 4. first value
   *
   * Strict mode priority:
   * 1. value for current language
   * 2. value for all languages
   * 3. value for default language
   *
   * Very strict mode priority:
   * 1. value for current language
   * 2. value for all languages
   */
  static getBestValue(eavValues: EavValues<any>, currentLanguage: string, defaultLanguage: string, mode: BestValueMode): FieldValue {
    if (eavValues == null) { return; }

    let bestDimensions = [currentLanguage, `~${currentLanguage}`];
    let bestValue = this.findValueForDimensions(eavValues, bestDimensions);
    if (bestValue !== undefined) { return bestValue; }

    bestDimensions = ['*'];
    bestValue = this.findValueForDimensions(eavValues, bestDimensions);
    if (bestValue !== undefined) { return bestValue; }

    if (mode === BestValueModes.Strict) { return; }

    bestDimensions = [defaultLanguage, `~${defaultLanguage}`];
    bestValue = this.findValueForDimensions(eavValues, bestDimensions);
    if (bestValue !== undefined) { return bestValue; }

    bestValue = eavValues.Values[0]?.Value;
    return bestValue;
  }

  static findOfExactDimension<T>(eavValues: EavValue<T>[], dimension: string): EavValue<T> {
    return eavValues.find(v => v.Dimensions.find(x => x.Value === dimension));
  }

  private static findValueForDimensions(eavValues: EavValues<any>, dimensions: string[]): FieldValue {
    const value = eavValues.Values.find(
      eavValue => !!eavValue.Dimensions.find(dimension => dimensions.includes(dimension.Value)),
    )?.Value;
    return value;
  }
}
