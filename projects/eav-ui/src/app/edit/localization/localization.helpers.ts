import { EavLogger } from '../../shared/logging/eav-logger';
import { EavValue, EavField } from '../shared/models/eav';
import { FormLanguage } from '../form/form-languages.model';
import { DimensionReader } from './dimension-reader';

// 2024-09-09 2dm - all moved to other helper objects

// const logSpecs = {
//   enabled: false,
//   name: 'LocalizationHelpers',
// };

// const log = new EavLogger(logSpecs);

export class LocalizationHelpers {
  // /**
  //  * Get translated value for currentLanguage,
  //  * if not exist return default language translation,
  //  * if default language also not exist return first value
  //  */
  // static translate<T>(language: FormLanguage, attributeValues: EavField<T>, defaultValue: T): T | null {
  //   if (!attributeValues)
  //     return defaultValue;

  //   const assigned: EavValue<T> = this.valuesOfLanguage(attributeValues, language)[0];
  //   if (assigned)
  //     return assigned.Value;

  //   const onDefault: EavValue<T> = this.valuesOfLanguage(attributeValues, FormLanguage.bothPrimary(language))[0];
  //   if (onDefault)
  //     return onDefault.Value;

  //   // TODO: maybe return value with *
  //   return attributeValues.Values[0]?.Value ?? null;
  // }

  // /**
  //  * Find all values which are of the current language.
  //  * 1. either directly assigned
  //  * 2. or read-only assigned
  //  * 3. or assigned to '*' when the current language is the default language
  //  * Note: almost private!
  //  */
  // static valuesOfLanguage<T>(field: EavField<T>, language: FormLanguage): EavValue<T>[] {
  //   if (!field) return [];
  //   return field.Values.filter(val => new DimensionReader(val.Dimensions, language).hasCurrent);
  // }

  // /**
  //  * 
  //  * @param val 
  //  * @param language 
  //  * @returns 
  //  * Note: almost private!
  //  */
  // static valueHasLanguage<T>(val: EavValue<T>, language: FormLanguage): EavDimension | undefined {
  //   return val.Dimensions.find(d =>
  //     d.Value === language.current
  //     || d.Value === `~${language.current}`
  //     || (language.current === language.primary && d.Value === '*'));
  // }


  // static #currentOfLanguage<T>(field: EavField<T>, language: FormLanguage): EavValue<T> {
  //   // first match if any is the one we're looking for
  //   return this.valuesOfLanguage(field, language)[0];
  // }

  // static isEditableOrReadonlyTranslationExist(field: EavField<any>, language: FormLanguage): boolean {
  //   if (!field) return false;
  //   return this.#valuesEditableOfCurrent(field, language).length > 0;
  // }

  // /**
  //  * Values of a field are for the current language,
  //  * if they are assigned to the current language or to '*' (but only when the current-language is also the primary-language)
  //  */
  // static #valuesEditableOfCurrent<T>(field: EavField<T>, langs: FormLanguage): EavValue<T>[] {
  //   if (!field) return [];
  //   return field.Values
  //     .filter(val => val.Dimensions.find(d => (d.Value === langs.current) || (d.Value === '*' && langs.current === langs.primary)));
  // }


  // /** A value in specified Language is editable, if assigned to current language or to '*' (but only when on default-language) */
  // static hasEditableValue(field: EavField<any>, language: FormLanguage): boolean {
  //   return this.#valuesEditableOfCurrent(field, language).length > 0;
  // }

  // // Number of editable translatable fields that
  // static countEditableValues(field: EavField<any>, language: FormLanguage): number {
  //   return this.#valuesEditableOfCurrent(field, language).length;
  // }

  // // Number of editable translatable fields that have some content
  // static countEditableValuesWithContent(field: EavField<any>, language: FormLanguage): number {
  //   if (!field) return 0;
  //   return this.#valuesEditableOfCurrent(field, language).filter(v => v.Value != "" && v.Value != null)?.length
  // }

  // static hasReadonlyValue(field: EavField<any>, language: string): boolean {
  //   if (!field) return false;
  //   return field.Values.filter(val => val.Dimensions.find(d => d.Value === `~${language}`)).length > 0;
  // }

  // static hasValueOnPrimary(field: EavField<any>, defaultLanguage: string): boolean {
  //   if (!field) return false;
  //   return field.Values.filter(val => val.Dimensions.find(d => d.Value === defaultLanguage || d.Value === '*')).length > 0;
  // }

  //#region Writer

  // /** Copy attributes from item */
  // static #updateAttribute(
  //   oldAttributes: EavEntityAttributes,
  //   attributeKey: string,
  //   attribute: EavField<any>,
  // ): EavEntityAttributes {
  //   const newAttributes: EavEntityAttributes = {};
  //   if (Object.keys(oldAttributes).length === 0) {
  //     const attributeCopy: EavField<any> = { ...attribute };
  //     newAttributes[attributeKey] = attributeCopy;
  //     return newAttributes;
  //   }

  //   for (const key of Object.keys(oldAttributes)) {
  //     if (key === attributeKey) {
  //       const attributeCopy: EavField<any> = { ...attribute };
  //       newAttributes[key] = attributeCopy;
  //     } else {
  //       const attributeCopy: EavField<any> = { ...oldAttributes[key] };
  //       newAttributes[key] = attributeCopy;
  //     }
  //   }

  //   if (oldAttributes[attributeKey] == null) {
  //     const attributeCopy: EavField<any> = { ...attribute };
  //     newAttributes[attributeKey] = attributeCopy;
  //   }
  //   return newAttributes;
  // }

  // /** Update values for languageKey */
  // static updateAttributesValues(
  //   allFields: EavEntityAttributes,
  //   updateValues: ItemValuesOfLanguage,
  //   language: FormLanguage,
  // ): EavEntityAttributes {
  //   const l = log.fn('updateAttributesValues', { allFields, updateValues, language });
  //   // copy attributes from item
  //   const eavAttributes: EavEntityAttributes = {};
  //   Object.keys(allFields).forEach(attributeKey => {
  //     const newItemValue = updateValues[attributeKey];
  //     // if new value exist update attribute for languageKey
  //     // if (newItemValue !== null && newItemValue !== undefined) {
  //     if (newItemValue !== undefined) {
  //       const fr = new FieldReader(allFields[attributeKey], language);
  //       const valueWithLanguageExist = fr.isEditableOrReadonlyTranslationExist(); // this.isEditableOrReadonlyTranslationExist(allFields[attributeKey], language);

  //       // if valueWithLanguageExist update value for languageKey
  //       if (valueWithLanguageExist) {
  //         const newValues: EavField<any> = {
  //           ...allFields[attributeKey],
  //           Values: allFields[attributeKey].Values.map(val => {
  //             const hasLanguage = !!this.valueHasLanguage(val, language);
  //             const newValue: EavValue<any> = hasLanguage
  //               // Update value for languageKey
  //               ? {
  //                   ...val,
  //                   Value: newItemValue,
  //                 }
  //                 : val;
  //             return newValue;
  //           })
  //         };
  //         eavAttributes[attributeKey] = newValues;
  //       } else { // else add new value with dimension languageKey
  //         l.a('saveAttributeValues add values ', { newItemValue });
  //         const newEavValue = EavValue.create(newItemValue, [EavDimension.create(language.current)]);
  //         eavAttributes[attributeKey] = {
  //           ...allFields[attributeKey],
  //           Values: [...allFields[attributeKey].Values, newEavValue]
  //         } satisfies EavField<any>;
  //       }
  //     } else { // else copy item attributes
  //       const attributeCopy: EavField<any> = { ...allFields[attributeKey] };
  //       eavAttributes[attributeKey] = attributeCopy;
  //     }
  //   });
  //   return eavAttributes;
  // }

  // /** update attribute value, and change language readonly state if needed */
  // static updateAttributeValue(
  //   allAttributes: EavEntityAttributes,
  //   attributeKey: string,
  //   updateValue: FieldValue,
  //   language: FormLanguage,
  //   isReadOnly: boolean,
  // ): EavEntityAttributes {
  //   // copy attributes from item
  //   let eavAttributes: EavEntityAttributes = {};
  //   let newLanguageValue = language.current;

  //   if (isReadOnly)
  //     newLanguageValue = `~${language.current}`;

  //   const attribute: EavField<any> = {
  //     ...allAttributes[attributeKey], Values: allAttributes[attributeKey].Values.map(val => {
  //       const hasLanguage = !!this.valueHasLanguage(val, language);
  //       const newValue: EavValue<any> = hasLanguage
  //         // Update value and dimension
  //         ? {
  //           ...val,
  //           // update value
  //           Value: updateValue,
  //           // update languageKey with newLanguageValue
  //           Dimensions: val.Dimensions.map(d => {
  //             const dimensionIsForLanguage = (d.Value === language.current
  //               || d.Value === `~${language.current}`
  //               || (language.current === language.primary && d.Value === '*'));
  //             return dimensionIsForLanguage
  //               ? { Value: newLanguageValue } satisfies EavDimension
  //               : d;
  //           })
  //         }
  //         : val;
  //       return newValue;
  //     })
  //   };
  //   eavAttributes = this.#updateAttribute(allAttributes, attributeKey, attribute);
  //   return eavAttributes;
  // }

  // static addAttributeValue(
  //   allAttributes: EavEntityAttributes,
  //   attributeValue: EavValue<any>,
  //   attributeKey: string,
  //   attributeType: string,
  // ): EavEntityAttributes {
  //   // copy attributes from item
  //   let eavAttributes: EavEntityAttributes = {};
  //   const attribute: EavField<any> =
  //     Object.keys(allAttributes).length === 0 || !allAttributes[attributeKey]
  //       ? {
  //         ...allAttributes[attributeKey],
  //         Values: [attributeValue],
  //         Type: attributeType
  //       }
  //       : {
  //         ...allAttributes[attributeKey],
  //         Values: [...allAttributes[attributeKey].Values, attributeValue],
  //         Type: attributeType
  //       };
  //   eavAttributes = this.#updateAttribute(allAttributes, attributeKey, attribute);
  //   return eavAttributes;
  // }

  // /** Add dimension to value with existing dimension */
  // static addAttributeDimension(
  //   allAttributes: EavEntityAttributes,
  //   attributeKey: string,
  //   newDimensionValue: string,
  //   existingDimensionValue: string,
  //   defaultLanguage: string,
  //   isReadOnly: boolean,
  // ): EavEntityAttributes {
  //   // copy attributes from item
  //   let eavAttributes: EavEntityAttributes = {};
  //   let newLanguageValue = newDimensionValue;

  //   if (isReadOnly) {
  //     newLanguageValue = `~${newDimensionValue}`;
  //   }

  //   const attribute: EavField<any> = {
  //     ...allAttributes[attributeKey], Values: allAttributes[attributeKey].Values.map(eavValue => {
  //       const newValue: EavValue<any> = eavValue.Dimensions.find(d => d.Value === existingDimensionValue
  //         || (existingDimensionValue === defaultLanguage && d.Value === '*'))
  //         // Update dimension for current language
  //         ? {
  //           ...eavValue,
  //           // if languageKey already exist
  //           Dimensions: eavValue.Dimensions.concat({ Value: newLanguageValue })
  //         }
  //         : eavValue;
  //       return newValue;
  //     })
  //   };
  //   eavAttributes = this.#updateAttribute(allAttributes, attributeKey, attribute);
  //   return eavAttributes;
  // }

  // /** Removes dimension (language) from attribute. If multiple dimensions exist, delete only dimension, else delete value and dimension */
  // static removeAttributeDimension(attributes: EavEntityAttributes, attributeKey: string, language: string): EavEntityAttributes {
  //   const oldAttributes = attributes;
  //   const validDimensions = [language, `~${language}`];

  //   const value = oldAttributes[attributeKey].Values.find(eavValue => {
  //     const dimensionExists = eavValue.Dimensions.some(d => validDimensions.includes(d.Value));
  //     return dimensionExists;
  //   });

  //   // given dimension doesn't exist for this attribute so no change is needed
  //   if (!value) {
  //     const attributesCopy: EavEntityAttributes = { ...oldAttributes };
  //     return attributesCopy;
  //   }

  //   let newAttribute: EavField<any>;
  //   if (value.Dimensions.length > 1) {
  //     // if multiple dimensions exist delete only dimension
  //     newAttribute = {
  //       ...oldAttributes[attributeKey],
  //       Values: oldAttributes[attributeKey].Values.map(eavValue => {
  //         const dimensionExists = eavValue.Dimensions.some(d => validDimensions.includes(d.Value));
  //         return (!dimensionExists)
  //           ? eavValue
  //           : {
  //               ...eavValue,
  //               Dimensions: eavValue.Dimensions.filter(d => !validDimensions.includes(d.Value)),
  //             } satisfies EavValue<any>;
  //       })
  //     };
  //   } else if (value.Dimensions.length === 1) {
  //     // if only one dimension exists delete value and dimension
  //     newAttribute = {
  //       ...oldAttributes[attributeKey],
  //       Values: oldAttributes[attributeKey].Values.filter(eavValue => {
  //         const dimensionExists = eavValue.Dimensions.some(d => validDimensions.includes(d.Value));
  //         return !dimensionExists;
  //       })
  //     };
  //   }

  //   const newAttributes = this.#updateAttribute(oldAttributes, attributeKey, newAttribute);
  //   return newAttributes;
  // }

  //#endregion

  //#region old getBestValue

  // /**
  //  * Default mode priority:
  //  * 1. value for current language
  //  * 2. value for all languages
  //  * 3. value for default language
  //  * 4. first value
  //  *
  //  * Strict mode priority:
  //  * 1. value for current language
  //  * 2. value for all languages
  //  * 3. value for default language
  //  *
  //  * Very strict mode priority:
  //  * 1. value for current language
  //  * 2. value for all languages
  //  */
  // static getBestValue(field: EavField<any>, currentLanguage: string, /* defaultLanguage: string, */ mode: BestValueMode): FieldValue {
  //   if (field == null) return;

  //   let bestDimensions = [currentLanguage, `~${currentLanguage}`];
  //   let bestValue = this.#findValueForDimensions(field, bestDimensions);
  //   if (bestValue !== undefined) { return bestValue; }

  //   bestDimensions = ['*'];
  //   bestValue = this.#findValueForDimensions(field, bestDimensions);
  //   if (bestValue !== undefined) { return bestValue; }

  //   if (mode === BestValueModes.Strict) return;

  //   // bestDimensions = [defaultLanguage, `~${defaultLanguage}`];
  //   // bestValue = this.#findValueForDimensions(field, bestDimensions);
  //   // if (bestValue !== undefined) { return bestValue; }

  //   bestValue = field.Values[0]?.Value;
  //   return bestValue;
  // }

  // // static findOfExactDimension<T>(field: EavValue<T>[], dimension: string): EavValue<T> {
  // //   return field.find(v => v.Dimensions.find(x => x.Value === dimension));
  // // }

  // static #findValueForDimensions(field: EavField<any>, dimensions: string[]): FieldValue {
  //   const value = field.Values.find(
  //     eavValue => !!eavValue.Dimensions.find(dimension => dimensions.includes(dimension.Value)),
  //   )?.Value;
  //   return value;
  // }

  //#endregion
}
