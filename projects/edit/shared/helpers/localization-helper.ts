import { take } from 'rxjs/operators';
import { FieldSettings } from '../../../edit-types';
import { angularConsoleLog } from '../../../ng-dialogs/src/app/shared/helpers/angular-console-log.helper';
import { EavAttributes, EavDimensions, EavValue } from '../models/eav';
import { EavValues } from '../models/eav/eav-values';
import { CalculatedInputType } from '../models/input-field-models';
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
        return translation.value;
        // return translations[0].value;
      } else {
        const translationDefault: EavValue<any> = this.getValueTranslation(attributeValues,
          defaultLanguage, defaultLanguage);
        // if default language translation exist then return translation
        if (translationDefault) {
          return translationDefault.value;
        } else {
          // else get first value
          // TODO: maybe return value with *
          return attributeValues.values[0] ? attributeValues.values[0].value : null;
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
    return allAttributesValues.values.find(eavValue =>
      eavValue.dimensions.find(d => d.value === languageKey
        || d.value === `~${languageKey}`
        || (languageKey === defaultLanguage && d.value === '*')) !== undefined);
  }

  public static isEditableOrReadonlyTranslationExist(allAttributesValues: EavValues<any>, languageKey: string,
    defaultLanguage: string): boolean {
    return allAttributesValues ? allAttributesValues.values.filter(c =>
      c.dimensions.find(d =>
        d.value === languageKey
        || d.value === `~${languageKey}`
        || (languageKey === defaultLanguage && d.value === '*'))).length > 0 : false;
  }

  /** Language is editable if langageKey exist or on default language * exist */
  public static isEditableTranslationExist(allAttributesValues: EavValues<any>, languageKey: string, defaultLanguage: string): boolean {
    return allAttributesValues ? allAttributesValues.values.filter(eavValue =>
      eavValue.dimensions.find(d => (d.value === languageKey)
        || (languageKey === defaultLanguage && d.value === '*'))).length > 0 : false;
  }

  public static isReadonlyTranslationExist(allAttributesValues: EavValues<any>, languageKey: string): boolean {
    return allAttributesValues ? allAttributesValues.values.filter(eavValue =>
      eavValue.dimensions.find(d => d.value === `~${languageKey}`)).length > 0 : false;
  }

  public static translationExistsInDefault(allAttributesValues: EavValues<any>, defaultLanguage: string): boolean {
    return allAttributesValues ? allAttributesValues.values.filter(eavValue =>
      eavValue.dimensions.find(d => d.value === defaultLanguage || d.value === '*')).length > 0 : false;
  }

  public static translationExistsInDefaultStrict(allAttributesValues: EavValues<any>, defaultLanguage: string,
    disableI18n: boolean): boolean {
    if (disableI18n) {
      return allAttributesValues ? allAttributesValues.values.filter(eavValue =>
        eavValue.dimensions.find(d => d.value === defaultLanguage || d.value === '*')).length > 0 : false;
    } else {
      return allAttributesValues ? allAttributesValues.values.filter(eavValue =>
        eavValue.dimensions.find(d => d.value === defaultLanguage)).length > 0 : false;
    }
  }

  public static isI18nDisabled(inputTypeService: InputTypeService, calculatedInputType: CalculatedInputType, fullSettings: EavAttributes) {
    let disableI18n = false;
    inputTypeService.getInputTypeById(calculatedInputType.inputType).pipe(take(1)).subscribe(type => {
      if (type?.DisableI18n === true) { disableI18n = true; }
    });
    const disableTranslationSetting = !!fullSettings.DisableTranslation?.values.find(value => value.value === true);
    if (disableTranslationSetting) {
      disableI18n = true;
    }
    return disableI18n;
  }

  public static updateAttribute(allAttributes: EavAttributes, attribute: EavValues<any>, attributeKey: string) {
    // copy attributes from item
    const eavAttributes: EavAttributes = new EavAttributes();
    if (Object.keys(allAttributes).length > 0) {
      Object.keys(allAttributes).forEach(key => {
        // const eavValueList: EavValue<any>[] = [];
        if (key === attributeKey) {
          eavAttributes[key] = { ...attribute };
        } else {
          eavAttributes[key] = { ...allAttributes[key] };
        }
      });
      if (!allAttributes[attributeKey]) {
        eavAttributes[attributeKey] = { ...attribute };
      }
    } else {
      eavAttributes[attributeKey] = { ...attribute };
    }
    return eavAttributes;
  }

  /** Update value for languageKey */
  public static updateAttributesValues(allAttributes: EavAttributes, updateValues: { [key: string]: any }, languageKey: string,
    defaultLanguage: string): EavAttributes {
    // copy attributes from item
    const eavAttributes: EavAttributes = new EavAttributes();
    Object.keys(allAttributes).forEach(attributeKey => {
      const newItemValue = updateValues[attributeKey];
      // if new value exist update attribute for languageKey
      // if (newItemValue !== null && newItemValue !== undefined) {
      if (newItemValue !== undefined) {
        const valueWithLanguageExist = this.isEditableOrReadonlyTranslationExist(
          allAttributes[attributeKey], languageKey, defaultLanguage);

        // if valueWithLanguageExist update value for languageKey
        if (valueWithLanguageExist) {
          eavAttributes[attributeKey] = {
            ...allAttributes[attributeKey], values: allAttributes[attributeKey].values.map(eavValue => {
              return eavValue.dimensions.find(d => d.value === languageKey
                || d.value === `~${languageKey}`
                || (languageKey === defaultLanguage && d.value === '*'))
                // Update value for languageKey
                ? {
                  ...eavValue,
                  value: newItemValue,
                }
                : eavValue;
            })
          };
        } else { // else add new value with dimension languageKey
          angularConsoleLog('saveAttributeValues add values ', newItemValue);
          const newEavValue = new EavValue(newItemValue, [new EavDimensions(languageKey)]);
          eavAttributes[attributeKey] = {
            ...allAttributes[attributeKey],
            values: [...allAttributes[attributeKey].values, newEavValue]
          };
        }
      } else { // else copy item attributes
        eavAttributes[attributeKey] = { ...allAttributes[attributeKey] };
      }
    });
    return eavAttributes;
  }

  /** update attribute value, and change language readonly state if needed */
  public static updateAttributeValue(allAttributes: EavAttributes, attributeKey: string, newValue: any, existingLanguageKey: string,
    defaultLanguage: string, isReadOnly: boolean): EavAttributes {
    // copy attributes from item
    let eavAttributes: EavAttributes = new EavAttributes();
    let newLanguageValue = existingLanguageKey;

    if (isReadOnly) {
      newLanguageValue = `~${existingLanguageKey}`;
    }

    const attribute: EavValues<any> = {
      ...allAttributes[attributeKey], values: allAttributes[attributeKey].values.map(eavValue => {
        return eavValue.dimensions.find(d => d.value === existingLanguageKey
          || d.value === `~${existingLanguageKey}`
          || (existingLanguageKey === defaultLanguage && d.value === '*')
        )
          // Update value and dimension
          ? {
            ...eavValue,
            // update value
            value: newValue,
            // update languageKey with newLanguageValue
            dimensions: eavValue.dimensions.map(dimension => {
              return (dimension.value === existingLanguageKey
                || dimension.value === `~${existingLanguageKey}`
                || (existingLanguageKey === defaultLanguage && dimension.value === '*'))
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

  public static addAttributeValue(allAttributes: EavAttributes, attributeValue: EavValue<any>, attributeKey: string,
    attributeType: string): EavAttributes {
    // copy attributes from item
    let eavAttributes: EavAttributes = new EavAttributes();
    const attribute: EavValues<any> =
      Object.keys(allAttributes).length === 0
        || !allAttributes[attributeKey] ?
        {
          // Add attribute
          ...allAttributes[attributeKey], values: [attributeValue], type: attributeType
        }
        : {
          // Add attribute
          ...allAttributes[attributeKey], values: [...allAttributes[attributeKey].values, attributeValue], type: attributeType
        };
    eavAttributes = this.updateAttribute(allAttributes, attribute, attributeKey);
    return eavAttributes;
  }

  /** Add dimension to value with existing dimension */
  public static addAttributeDimension(allAttributes: EavAttributes, attributeKey: string, newDimensionValue: any,
    existingDimensionValue: string, defaultLanguage: string, isReadOnly: boolean): EavAttributes {
    // copy attributes from item
    let eavAttributes: EavAttributes = new EavAttributes();
    let newLanguageValue = newDimensionValue;

    if (isReadOnly) {
      newLanguageValue = `~${newDimensionValue}`;
    }

    const attribute: EavValues<any> = {
      ...allAttributes[attributeKey], values: allAttributes[attributeKey].values.map(eavValue => {
        return eavValue.dimensions.find(d => d.value === existingDimensionValue
          || (existingDimensionValue === defaultLanguage && d.value === '*'))
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

  /** Remove language. If more dimensions (languages) exist, delete only dimension, else delete value and dimension */
  public static removeAttributeDimension(allAttributes: EavAttributes, attributeKey: string, languageKey: string): EavAttributes {
    angularConsoleLog('removeAttributeDimension: ', allAttributes);
    // copy attributes from item
    let eavAttributes: EavAttributes = new EavAttributes();
    const value: EavValue<any> = allAttributes[attributeKey].values.find(eavValue =>
      eavValue.dimensions.find(d => d.value === languageKey
        || d.value === `~${languageKey}`) !== undefined);
    let attribute: EavValues<any> = null;

    if (!value) {
      return { ...allAttributes };
    }

    // if more dimensions exist delete only dimension
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
    // if only one dimension exists delete value and dimension
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
   */
  public static getBestValue(eavValues: EavValues<any>, lang: string, defaultLang: string): EavValue<any> {
    let bestDimensions = [lang, `~${lang}`];
    let bestValue = this.findValueForDimensions(eavValues, bestDimensions);
    if (bestValue != null) { return bestValue; }

    bestDimensions = ['*'];
    bestValue = this.findValueForDimensions(eavValues, bestDimensions);
    if (bestValue != null) { return bestValue; }

    bestDimensions = [defaultLang, `~${defaultLang}`];
    bestValue = this.findValueForDimensions(eavValues, bestDimensions);
    if (bestValue != null) { return bestValue; }

    bestValue = eavValues.values[0];
    return bestValue;
  }

  private static findValueForDimensions(eavValues: EavValues<any>, dimensions: string[]): EavValue<any> {
    const value = eavValues.values.find(
      eavValue => !!eavValue.dimensions.find(dimension => dimensions.includes(dimension.value)),
    );
    return value;
  }
}
