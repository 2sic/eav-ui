import { FieldValue } from '../../../../../edit-types';
import { EavLogger } from '../../shared/logging/eav-logger';
import { EavDimension, EavEntityAttributes, EavValue, EavField } from '../shared/models/eav';
import { FormLanguage } from '../state/form-languages.model';
import { ItemValuesOfLanguage } from '../state/item-values-of-language.model';
import { BestValueMode, BestValueModes } from './localization.constants';

const logThis = false;
const nameOfThis = 'LocalizationHelpers';

const log = new EavLogger(nameOfThis, logThis);

export class LocalizationHelpers {
  /**
   * Get translated value for currentLanguage,
   * if not exist return default language translation,
   * if default language also not exist return first value
   */
  static translate<T>(language: FormLanguage, attributeValues: EavField<T>, defaultValue: T): T | null {
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

  static getValueOrDefault(field: EavField<any>, language: FormLanguage): EavValue<any> {
    let translation = this.getValueTranslation(field, language);
    return translation
      ?? this.getValueTranslation(field, FormLanguage.bothPrimary(language));
  }

  /**
   * Find all values which are of the current language.
   * 1. either directly assigned
   * 2. or read-only assigned
   * 3. or assigned to '*' when the current language is the default language
   */
  private static valuesOfLanguage<T>(field: EavField<T>, language: FormLanguage): EavValue<T>[] {
    if (!field) return [];
    return field.Values.filter(val => this.valueHasLanguage(val, language));
  }

  private static valueHasLanguage<T>(val: EavValue<T>, language: FormLanguage): EavDimension | undefined {
    return val.Dimensions.find(d =>
      d.Value === language.current
      || d.Value === `~${language.current}`
      || (language.current === language.primary && d.Value === '*'));
  }


  static getValueTranslation<T>(field: EavField<T>, language: FormLanguage): EavValue<T> {
    // first match if any is the one we're looking for
    return this.valuesOfLanguage(field, language)[0];
  }

  static isEditableOrReadonlyTranslationExist(field: EavField<any>, language: FormLanguage): boolean {
    if (!field) return false;
    return this.valuesEditableOfCurrent(field, language).length > 0;
  }

  /**
   * Values of a field are for the current language,
   * if they are assigned to the current language or to '*' (but only when the current-language is also the primary-language)
   */
  private static valuesEditableOfCurrent<T>(field: EavField<T>, langs: FormLanguage): EavValue<T>[] {
    if (!field) return [];
    return field.Values
      .filter(val => val.Dimensions.find(d => (d.Value === langs.current) || (d.Value === '*' && langs.current === langs.primary)));
  }


  /** A value in specified Language is editable, if assigned to current language or to '*' (but only when on default-language) */
  static hasEditableValue(field: EavField<any>, language: FormLanguage): boolean {
    return this.valuesEditableOfCurrent(field, language).length > 0;
  }

  // Number of editable translatable fields that
  static countEditableValues(field: EavField<any>, language: FormLanguage): number {
    return this.valuesEditableOfCurrent(field, language).length;
  }

  // Number of editable translatable fields that have some content
  static countEditableValuesWithContent(field: EavField<any>, language: FormLanguage): number {
    if (!field) return 0;
    return this.valuesEditableOfCurrent(field, language).filter(v => v.Value != "" && v.Value != null)?.length
  }

  static hasReadonlyValue(field: EavField<any>, language: string): boolean {
    if (!field) return false;
    return field.Values.filter(val => val.Dimensions.find(d => d.Value === `~${language}`)).length > 0;
  }

  static hasValueOnPrimary(field: EavField<any>, defaultLanguage: string): boolean {
    if (!field) return false;
    return field.Values.filter(val => val.Dimensions.find(d => d.Value === defaultLanguage || d.Value === '*')).length > 0;
  }

  /** Copy attributes from item */
  private static updateAttribute(
    oldAttributes: EavEntityAttributes,
    attributeKey: string,
    attribute: EavField<any>,
  ): EavEntityAttributes {
    const newAttributes: EavEntityAttributes = {};
    if (Object.keys(oldAttributes).length === 0) {
      const attributeCopy: EavField<any> = { ...attribute };
      newAttributes[attributeKey] = attributeCopy;
      return newAttributes;
    }

    for (const key of Object.keys(oldAttributes)) {
      if (key === attributeKey) {
        const attributeCopy: EavField<any> = { ...attribute };
        newAttributes[key] = attributeCopy;
      } else {
        const attributeCopy: EavField<any> = { ...oldAttributes[key] };
        newAttributes[key] = attributeCopy;
      }
    }

    if (oldAttributes[attributeKey] == null) {
      const attributeCopy: EavField<any> = { ...attribute };
      newAttributes[attributeKey] = attributeCopy;
    }
    return newAttributes;
  }

  /** Update values for languageKey */
  static updateAttributesValues(
    allFields: EavEntityAttributes,
    updateValues: ItemValuesOfLanguage,
    language: FormLanguage,
  ): EavEntityAttributes {
    const l = log.fn('updateAttributesValues', { allFields, updateValues, language });
    // copy attributes from item
    const eavAttributes: EavEntityAttributes = {};
    Object.keys(allFields).forEach(attributeKey => {
      const newItemValue = updateValues[attributeKey];
      // if new value exist update attribute for languageKey
      // if (newItemValue !== null && newItemValue !== undefined) {
      if (newItemValue !== undefined) {
        const valueWithLanguageExist = this.isEditableOrReadonlyTranslationExist(allFields[attributeKey], language);

        // if valueWithLanguageExist update value for languageKey
        if (valueWithLanguageExist) {
          const newValues: EavField<any> = {
            ...allFields[attributeKey],
            Values: allFields[attributeKey].Values.map(val => {
              const hasLanguage = !!this.valueHasLanguage(val, language);
              const newValue: EavValue<any> = hasLanguage
                // Update value for languageKey
                ? {
                  ...val,
                  Value: newItemValue,
                }
                : val;
              return newValue;
            })
          };
          eavAttributes[attributeKey] = newValues;
        } else { // else add new value with dimension languageKey
          l.a('saveAttributeValues add values ', { newItemValue });
          const newEavValue = EavValue.create(newItemValue, [EavDimension.create(language.current)]);
          const newAttribute: EavField<any> = {
            ...allFields[attributeKey],
            Values: [...allFields[attributeKey].Values, newEavValue]
          };
          eavAttributes[attributeKey] = newAttribute;
        }
      } else { // else copy item attributes
        const attributeCopy: EavField<any> = { ...allFields[attributeKey] };
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
    language: FormLanguage,
    isReadOnly: boolean,
  ): EavEntityAttributes {
    // copy attributes from item
    let eavAttributes: EavEntityAttributes = {};
    let newLanguageValue = language.current;

    if (isReadOnly)
      newLanguageValue = `~${language.current}`;

    const attribute: EavField<any> = {
      ...allAttributes[attributeKey], Values: allAttributes[attributeKey].Values.map(val => {
        const hasLanguage = !!this.valueHasLanguage(val, language);
        const newValue: EavValue<any> = hasLanguage
          // Update value and dimension
          ? {
            ...val,
            // update value
            Value: updateValue,
            // update languageKey with newLanguageValue
            Dimensions: val.Dimensions.map(d => {
              const dimensionIsForLanguage = (d.Value === language.current
                || d.Value === `~${language.current}`
                || (language.current === language.primary && d.Value === '*'));
              return dimensionIsForLanguage
                ? { Value: newLanguageValue } satisfies EavDimension
                : d;
            })
          }
          : val;
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
    const attribute: EavField<any> =
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

    const attribute: EavField<any> = {
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

    let newAttribute: EavField<any>;
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
  static getBestValue(eavValues: EavField<any>, currentLanguage: string, defaultLanguage: string, mode: BestValueMode): FieldValue {
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

  private static findValueForDimensions(eavValues: EavField<any>, dimensions: string[]): FieldValue {
    const value = eavValues.Values.find(
      eavValue => !!eavValue.Dimensions.find(dimension => dimensions.includes(dimension.Value)),
    )?.Value;
    return value;
  }
}
