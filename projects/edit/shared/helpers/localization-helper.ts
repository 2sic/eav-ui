import { take } from 'rxjs/operators';
import { FieldSettings } from '../../../edit-types';
import { angularConsoleLog } from '../../../ng-dialogs/src/app/shared/helpers/angular-console-log.helper';
import { CalculatedInputType } from '../models';
import { EavAttributes, EavDimension, EavValue, EavValues } from '../models/eav';
import { InputTypeService } from '../store/ngrx-data/input-type.service';

export class LocalizationHelper {
  /**
   * Get translated value for currentLanguage,
   * if not exist return default language translation,
   * if default language also not exist return first value
   */
  public static translate(currentLanguage: string, defaultLanguage: string, attributeValues: EavValues<any>, defaultValue: any): any {
    if (attributeValues) {
      const translation: EavValue<any> = this.getValueTranslation(attributeValues, currentLanguage, defaultLanguage);
      // if translation exist then return translation
      if (translation) {
        return translation.Value;
        // return translations[0].value;
      } else {
        const translationDefault: EavValue<any> = this.getValueTranslation(attributeValues,
          defaultLanguage, defaultLanguage);
        // if default language translation exist then return translation
        if (translationDefault) {
          return translationDefault.Value;
        } else {
          // else get first value
          // TODO: maybe return value with *
          return attributeValues.Values[0] ? attributeValues.Values[0].Value : null;
        }
      }
    } else {
      return defaultValue;
    }
  }

  public static getValueOrDefault(allAttributesValues: EavValues<any>, languageKey: string,
    defaultLanguage: string): EavValue<any> {
    let translation = LocalizationHelper.getValueTranslation(allAttributesValues, languageKey, defaultLanguage);
    if (translation === null || translation === undefined) {
      translation = LocalizationHelper.getValueTranslation(allAttributesValues, defaultLanguage, defaultLanguage);
    }
    return translation;
  }

  public static getValueTranslation(allAttributesValues: EavValues<any>, languageKey: string,
    defaultLanguage: string): EavValue<any> {
    return allAttributesValues.Values.find(eavValue =>
      eavValue.Dimensions.find(d => d.Value === languageKey
        || d.Value === `~${languageKey}`
        || (languageKey === defaultLanguage && d.Value === '*')) !== undefined);
  }

  public static isEditableOrReadonlyTranslationExist(allAttributesValues: EavValues<any>, languageKey: string,
    defaultLanguage: string): boolean {
    return allAttributesValues ? allAttributesValues.Values.filter(c =>
      c.Dimensions.find(d =>
        d.Value === languageKey
        || d.Value === `~${languageKey}`
        || (languageKey === defaultLanguage && d.Value === '*'))).length > 0 : false;
  }

  /** Language is editable if langageKey exist or on default language * exist */
  public static isEditableTranslationExist(allAttributesValues: EavValues<any>, languageKey: string, defaultLanguage: string): boolean {
    return allAttributesValues ? allAttributesValues.Values.filter(eavValue =>
      eavValue.Dimensions.find(d => (d.Value === languageKey)
        || (languageKey === defaultLanguage && d.Value === '*'))).length > 0 : false;
  }

  public static isReadonlyTranslationExist(allAttributesValues: EavValues<any>, languageKey: string): boolean {
    return allAttributesValues ? allAttributesValues.Values.filter(eavValue =>
      eavValue.Dimensions.find(d => d.Value === `~${languageKey}`)).length > 0 : false;
  }

  public static translationExistsInDefault(allAttributesValues: EavValues<any>, defaultLanguage: string): boolean {
    return allAttributesValues ? allAttributesValues.Values.filter(eavValue =>
      eavValue.Dimensions.find(d => d.Value === defaultLanguage || d.Value === '*')).length > 0 : false;
  }

  public static translationExistsInDefaultStrict(allAttributesValues: EavValues<any>, defaultLanguage: string,
    disableI18n: boolean): boolean {
    if (disableI18n) {
      return allAttributesValues ? allAttributesValues.Values.filter(eavValue =>
        eavValue.Dimensions.find(d => d.Value === defaultLanguage || d.Value === '*')).length > 0 : false;
    } else {
      return allAttributesValues ? allAttributesValues.Values.filter(eavValue =>
        eavValue.Dimensions.find(d => d.Value === defaultLanguage)).length > 0 : false;
    }
  }

  public static isI18nDisabled(inputTypeService: InputTypeService, calculatedInputType: CalculatedInputType, fullSettings: EavAttributes) {
    let disableI18n = false;
    inputTypeService.getInputTypeById(calculatedInputType.inputType).pipe(take(1)).subscribe(type => {
      if (type?.DisableI18n === true) { disableI18n = true; }
    });
    const disableTranslationSetting = !!fullSettings.DisableTranslation?.Values.find(value => value.Value === true);
    if (disableTranslationSetting) {
      disableI18n = true;
    }
    return disableI18n;
  }

  public static updateAttribute(allAttributes: EavAttributes, attribute: EavValues<any>, attributeKey: string) {
    // copy attributes from item
    const eavAttributes: EavAttributes = {};
    if (Object.keys(allAttributes).length > 0) {
      Object.keys(allAttributes).forEach(key => {
        // const eavValueList: EavValue<any>[] = [];
        if (key === attributeKey) {
          const attributeCopy: EavValues<any> = { ...attribute };
          eavAttributes[key] = attributeCopy;
        } else {
          const attributeCopy: EavValues<any> = { ...allAttributes[key] };
          eavAttributes[key] = attributeCopy;
        }
      });
      if (!allAttributes[attributeKey]) {
        const attributeCopy: EavValues<any> = { ...attribute };
        eavAttributes[attributeKey] = attributeCopy;
      }
    } else {
      const attributeCopy: EavValues<any> = { ...attribute };
      eavAttributes[attributeKey] = attributeCopy;
    }
    return eavAttributes;
  }

  /** Update value for languageKey */
  public static updateAttributesValues(allAttributes: EavAttributes, updateValues: { [key: string]: any }, languageKey: string,
    defaultLanguage: string): EavAttributes {
    // copy attributes from item
    const eavAttributes: EavAttributes = {};
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
          const newEavValue = new EavValue(newItemValue, [EavDimension.create(languageKey)]);
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
  public static updateAttributeValue(allAttributes: EavAttributes, attributeKey: string, updateValue: any, existingLanguageKey: string,
    defaultLanguage: string, isReadOnly: boolean): EavAttributes {
    // copy attributes from item
    let eavAttributes: EavAttributes = {};
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
    eavAttributes = this.updateAttribute(allAttributes, attribute, attributeKey);
    return eavAttributes;
  }

  public static addAttributeValue(allAttributes: EavAttributes, attributeValue: EavValue<any>, attributeKey: string,
    attributeType: string): EavAttributes {
    // copy attributes from item
    let eavAttributes: EavAttributes = {};
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
    eavAttributes = this.updateAttribute(allAttributes, attribute, attributeKey);
    return eavAttributes;
  }

  /** Add dimension to value with existing dimension */
  public static addAttributeDimension(allAttributes: EavAttributes, attributeKey: string, newDimensionValue: any,
    existingDimensionValue: string, defaultLanguage: string, isReadOnly: boolean): EavAttributes {
    // copy attributes from item
    let eavAttributes: EavAttributes = {};
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
    eavAttributes = this.updateAttribute(allAttributes, attribute, attributeKey);
    return eavAttributes;
  }

  /** Remove language. If more dimensions (languages) exist, delete only dimension, else delete value and dimension */
  public static removeAttributeDimension(allAttributes: EavAttributes, attributeKey: string, languageKey: string): EavAttributes {
    angularConsoleLog('removeAttributeDimension: ', allAttributes);
    // copy attributes from item
    let eavAttributes: EavAttributes = {};
    const value: EavValue<any> = allAttributes[attributeKey].Values.find(eavValue =>
      eavValue.Dimensions.find(d => d.Value === languageKey
        || d.Value === `~${languageKey}`) !== undefined);
    let attribute: EavValues<any> = null;

    if (!value) {
      const attributesCopy: EavAttributes = { ...allAttributes };
      return attributesCopy;
    }

    // if more dimensions exist delete only dimension
    if (value.Dimensions.length > 1) {
      attribute = {
        ...allAttributes[attributeKey], Values: allAttributes[attributeKey].Values.map(eavValue => {
          const newValue: EavValue<any> = eavValue.Dimensions.find(d => d.Value === languageKey || d.Value === `~${languageKey}`)
            ? {
              ...eavValue,
              // delete only dimension
              Dimensions: eavValue.Dimensions.filter(dimension =>
                (dimension.Value !== languageKey && dimension.Value !== `~${languageKey}`)
              )
            }
            : eavValue;
          return newValue;
        })
      };
    }
    // if only one dimension exists delete value and dimension
    if (value.Dimensions.length === 1) {
      attribute = {
        // delete dimension and value
        ...allAttributes[attributeKey], Values: allAttributes[attributeKey].Values.filter(eavValue => {
          return eavValue.Dimensions.find(d => d.Value !== languageKey && d.Value !== `~${languageKey}`);
        })
      };
    }
    eavAttributes = this.updateAttribute(allAttributes, attribute, attributeKey);
    return eavAttributes;
  }

  public static translateSettings(settings: EavAttributes, currentLanguage: string, defaultLanguage: string): FieldSettings {
    const settingsTranslated: { [key: string]: any } = {};
    Object.keys(settings).forEach(attributesKey => {
      settingsTranslated[attributesKey] = LocalizationHelper.translate(currentLanguage,
        defaultLanguage, settings[attributesKey], false);
    });
    return settingsTranslated as FieldSettings;
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
  // public static getBestValue(eavValues: EavValues<any>, lang: string, defaultLang: string): EavValue<any> {
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
