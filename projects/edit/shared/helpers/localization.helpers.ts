import { FieldSettings } from '../../../edit-types';
import { DataTypeConstants } from '../../../ng-dialogs/src/app/content-type-fields/constants/data-type.constants';
import { angularConsoleLog } from '../../../ng-dialogs/src/app/shared/helpers/angular-console-log.helper';
import { CalculatedInputType } from '../models';
import { EavDimension, EavEntityAttributes, EavItem, EavValue, EavValues } from '../models/eav';
import { ContentTypeService } from '../store/ngrx-data/content-type.service';
import { InputTypeService } from '../store/ngrx-data/input-type.service';
import { InputFieldHelpers } from './input-field.helpers';

export class LocalizationHelpers {
  /**
   * Get translated value for currentLanguage,
   * if not exist return default language translation,
   * if default language also not exist return first value
   */
  static translate(currentLanguage: string, defaultLanguage: string, attributeValues: EavValues<any>, defaultValue: any): any {
    if (!attributeValues) { return defaultValue; }

    const translation: EavValue<any> = this.getValueTranslation(attributeValues, currentLanguage, defaultLanguage);
    if (translation) { return translation.Value; }

    const translationDefault: EavValue<any> = this.getValueTranslation(attributeValues, defaultLanguage, defaultLanguage);
    if (translationDefault) { return translationDefault.Value; }

    // TODO: maybe return value with *
    return attributeValues.Values[0]?.Value ?? null;
  }

  static getValueOrDefault(allAttributesValues: EavValues<any>, languageKey: string, defaultLanguage: string): EavValue<any> {
    let translation = LocalizationHelpers.getValueTranslation(allAttributesValues, languageKey, defaultLanguage);
    if (translation == null) {
      translation = LocalizationHelpers.getValueTranslation(allAttributesValues, defaultLanguage, defaultLanguage);
    }
    return translation;
  }

  static getValueTranslation(allAttributesValues: EavValues<any>, languageKey: string, defaultLanguage: string): EavValue<any> {
    return allAttributesValues.Values.find(eavValue =>
      eavValue.Dimensions.find(d => d.Value === languageKey
        || d.Value === `~${languageKey}`
        || (languageKey === defaultLanguage && d.Value === '*')) !== undefined);
  }

  static isEditableOrReadonlyTranslationExist(allAttributesValues: EavValues<any>, languageKey: string, defaultLanguage: string): boolean {
    return allAttributesValues ? allAttributesValues.Values.filter(c =>
      c.Dimensions.find(d =>
        d.Value === languageKey
        || d.Value === `~${languageKey}`
        || (languageKey === defaultLanguage && d.Value === '*'))).length > 0 : false;
  }

  /** Language is editable if langageKey exist or on default language * exist */
  static isEditableTranslationExist(allAttributesValues: EavValues<any>, languageKey: string, defaultLanguage: string): boolean {
    return allAttributesValues ? allAttributesValues.Values.filter(eavValue =>
      eavValue.Dimensions.find(d => (d.Value === languageKey)
        || (languageKey === defaultLanguage && d.Value === '*'))).length > 0 : false;
  }

  static isReadonlyTranslationExist(allAttributesValues: EavValues<any>, languageKey: string): boolean {
    return allAttributesValues ? allAttributesValues.Values.filter(eavValue =>
      eavValue.Dimensions.find(d => d.Value === `~${languageKey}`)).length > 0 : false;
  }

  static translationExistsInDefault(allAttributesValues: EavValues<any>, defaultLanguage: string): boolean {
    return allAttributesValues ? allAttributesValues.Values.filter(eavValue =>
      eavValue.Dimensions.find(d => d.Value === defaultLanguage || d.Value === '*')).length > 0 : false;
  }

  static translationExistsInDefaultStrict(allAttributesValues: EavValues<any>, defaultLanguage: string, disableI18n: boolean): boolean {
    if (disableI18n) {
      return allAttributesValues ? allAttributesValues.Values.filter(eavValue =>
        eavValue.Dimensions.find(d => d.Value === defaultLanguage || d.Value === '*')).length > 0 : false;
    } else {
      return allAttributesValues ? allAttributesValues.Values.filter(eavValue =>
        eavValue.Dimensions.find(d => d.Value === defaultLanguage)).length > 0 : false;
    }
  }

  static isI18nDisabled(
    inputTypeService: InputTypeService,
    calculatedInputType: CalculatedInputType,
    fullSettings: EavEntityAttributes,
  ): boolean {
    const inputType = inputTypeService.getInputType(calculatedInputType.inputType);
    if (inputType?.DisableI18n === true) { return true; }

    const disableTranslationSetting = !!fullSettings.DisableTranslation?.Values.find(value => value.Value === true);
    if (disableTranslationSetting) { return true; }

    return false;
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

  /** Update value for languageKey */
  static updateAttributesValues(
    allAttributes: EavEntityAttributes,
    updateValues: { [key: string]: any },
    languageKey: string,
    defaultLanguage: string,
  ): EavEntityAttributes {
    // copy attributes from item
    const eavAttributes: EavEntityAttributes = {};
    Object.keys(allAttributes).forEach(attributeKey => {
      const newItemValue = updateValues[attributeKey];
      // if new value exist update attribute for languageKey
      // if (newItemValue !== null && newItemValue !== undefined) {
      if (newItemValue !== undefined) {
        const valueWithLanguageExist = this.isEditableOrReadonlyTranslationExist(
          allAttributes[attributeKey], languageKey, defaultLanguage);

        // if valueWithLanguageExist update value for languageKey
        if (valueWithLanguageExist) {
          const newValues: EavValues<any> = {
            ...allAttributes[attributeKey], Values: allAttributes[attributeKey].Values.map(eavValue => {
              const newValue: EavValue<any> = eavValue.Dimensions.find(d => d.Value === languageKey
                || d.Value === `~${languageKey}`
                || (languageKey === defaultLanguage && d.Value === '*'))
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
          angularConsoleLog('saveAttributeValues add values ', newItemValue);
          const newEavValue = EavValue.create(newItemValue, [EavDimension.create(languageKey)]);
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
    updateValue: any,
    existingLanguageKey: string,
    defaultLanguage: string,
    isReadOnly: boolean,
  ): EavEntityAttributes {
    // copy attributes from item
    let eavAttributes: EavEntityAttributes = {};
    let newLanguageValue = existingLanguageKey;

    if (isReadOnly) {
      newLanguageValue = `~${existingLanguageKey}`;
    }

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
      Object.keys(allAttributes).length === 0
        || !allAttributes[attributeKey] ?
        {
          // Add attribute
          ...allAttributes[attributeKey], Values: [attributeValue], Type: attributeType
        }
        : {
          // Add attribute
          ...allAttributes[attributeKey], Values: [...allAttributes[attributeKey].Values, attributeValue], Type: attributeType
        };
    eavAttributes = this.updateAttribute(allAttributes, attributeKey, attribute);
    return eavAttributes;
  }

  /** Add dimension to value with existing dimension */
  static addAttributeDimension(
    allAttributes: EavEntityAttributes,
    attributeKey: string,
    newDimensionValue: any,
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
          if (!dimensionExists) { return eavValue; }

          const newValue: EavValue<any> = {
            ...eavValue,
            Dimensions: eavValue.Dimensions.filter(dimension => !validDimensions.includes(dimension.Value)),
          };
          return newValue;
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

  static translateSettings(settings: EavEntityAttributes, currentLanguage: string, defaultLanguage: string): FieldSettings {
    const translated: { [key: string]: any } = {};
    for (const key of Object.keys(settings)) {
      translated[key] = LocalizationHelpers.translate(currentLanguage, defaultLanguage, settings[key], false);
    }
    return translated as FieldSettings;
  }

  static valuesExistInDefaultLanguage(
    items: EavItem[],
    defaultLanguage: string,
    inputTypeService: InputTypeService,
    contentTypeService: ContentTypeService,
  ): boolean {
    const inputTypes = inputTypeService.getInputTypes();

    for (const item of items) {
      const contentTypeId = InputFieldHelpers.getContentTypeId(item);
      const contentType = contentTypeService.getContentType(contentTypeId);

      const attributesValues = Object.keys(item.Entity.Attributes).map(attributeKey => {
        const ctAttribute = contentType.Attributes.find(a => a.Name === attributeKey);
        const calculatedInputType = InputFieldHelpers.calculateInputType(ctAttribute, inputTypes);
        const disableI18n = LocalizationHelpers.isI18nDisabled(inputTypeService, calculatedInputType, ctAttribute.Settings);
        return { values: item.Entity.Attributes[attributeKey], disableI18n };
      });

      const nonEmpty = contentType.Attributes.filter(a => a.Type !== DataTypeConstants.Empty);
      if (attributesValues.length < nonEmpty.length) { return false; }

      for (const attributeValues of attributesValues) {
        const translationExistsInDefault = LocalizationHelpers.translationExistsInDefaultStrict(
          attributeValues.values, defaultLanguage, attributeValues.disableI18n,
        );
        if (!translationExistsInDefault) { return false; }
      }
    }

    return true;
  }

  /**
   * Find best value in priority order:
   * 1. value for current language
   * 2. value for all languages
   * 3. value for default language
   * 4. first value
   *
   * Similar to LocalizationHelper.translate(), but returns whole value object.
   */
  // static getBestValue(eavValues: EavValues<any>, lang: string, defaultLang: string): EavValue<any> {
  //   let bestDimensions = [lang, `~${lang}`];
  //   let bestValue = this.findValueForDimensions(eavValues, bestDimensions);
  //   if (bestValue != null) { return bestValue; }

  //   bestDimensions = ['*'];
  //   bestValue = this.findValueForDimensions(eavValues, bestDimensions);
  //   if (bestValue != null) { return bestValue; }

  //   bestDimensions = [defaultLang, `~${defaultLang}`];
  //   bestValue = this.findValueForDimensions(eavValues, bestDimensions);
  //   if (bestValue != null) { return bestValue; }

  //   bestValue = eavValues.values[0];
  //   return bestValue;
  // }

  // private static findValueForDimensions(eavValues: EavValues<any>, dimensions: string[]): EavValue<any> {
  //   const value = eavValues.values.find(
  //     eavValue => !!eavValue.dimensions.find(dimension => dimensions.includes(dimension.value)),
  //   );
  //   return value;
  // }
}
