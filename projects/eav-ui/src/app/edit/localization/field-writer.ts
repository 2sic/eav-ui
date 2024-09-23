import { FormLanguage } from '../form/form-languages.model';
import { EavDimension } from '../shared/models/eav/eav-dimension';
import { EavEntityAttributes } from '../shared/models/eav/eav-entity-attributes';
import { EavValue } from '../shared/models/eav/eav-value';
import { EavField } from '../shared/models/eav/eav-values';
import { ItemValuesOfLanguage } from '../state/item-values-of-language.model';
import { FieldReader } from './field-reader';
import { DimensionReader } from './dimension-reader';
import { FieldValue } from '../../../../../edit-types/src/FieldValue';
import { classLog } from '../../shared/logging';

export class FieldWriter {

  log = classLog({FieldWriter});

  /** Copy attributes from item */
  #updateAttribute(
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
  updateAttributesValues(
    allFields: EavEntityAttributes,
    updateValues: ItemValuesOfLanguage,
    language: FormLanguage,
  ): EavEntityAttributes {
    const l = this.log.fn('updateAttributesValues', { allFields, updateValues, language });
    // copy attributes from item
    const eavAttributes: EavEntityAttributes = {};
    Object.keys(allFields).forEach(attributeKey => {
      const newItemValue = updateValues[attributeKey];
      // if new value exist update attribute for languageKey   
      // it's important to check for undefined, because empty string and sometimes null (bool-tristate) are valid values
      if (newItemValue !== undefined) {
        const fr = new FieldReader(allFields[attributeKey], language);
        const valueWithLanguageExist = fr.isEditableOrReadonlyTranslationExist();

        // if valueWithLanguageExist update value for languageKey
        if (valueWithLanguageExist) {
          const newValues: EavField<any> = {
            ...allFields[attributeKey],
            Values: allFields[attributeKey].Values.map(val => {
              const hasLanguage = new DimensionReader(val.Dimensions, language).hasCurrent;
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
          eavAttributes[attributeKey] = {
            ...allFields[attributeKey],
            Values: [...allFields[attributeKey].Values, newEavValue]
          } satisfies EavField<any>;
        }
      } else { // else copy item attributes
        eavAttributes[attributeKey] = { ...allFields[attributeKey] };
      }
    });
    return eavAttributes;
  }

  /** update attribute value, and change language readonly state if needed */
  updateAttributeValue(
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
        const hasLanguage = new DimensionReader(val.Dimensions, language).hasCurrent;
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
    eavAttributes = this.#updateAttribute(allAttributes, attributeKey, attribute);
    return eavAttributes;
  }

  addAttributeValue(
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
    eavAttributes = this.#updateAttribute(allAttributes, attributeKey, attribute);
    return eavAttributes;
  }

  /** Add dimension to value with existing dimension */
  addAttributeDimension(
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
    eavAttributes = this.#updateAttribute(allAttributes, attributeKey, attribute);
    return eavAttributes;
  }

  /** Removes dimension (language) from attribute. If multiple dimensions exist, delete only dimension, else delete value and dimension */
  removeAttributeDimension(attributes: EavEntityAttributes, attributeKey: string, language: string): EavEntityAttributes {
    const oldAttributes = attributes;
    const validDimensions = [language, `~${language}`];

    const value = oldAttributes[attributeKey].Values.find(eavValue => {
      const dimensionExists = eavValue.Dimensions.some(d => validDimensions.includes(d.Value));
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
          const dimensionExists = eavValue.Dimensions.some(d => validDimensions.includes(d.Value));
          return (!dimensionExists)
            ? eavValue
            : {
                ...eavValue,
                Dimensions: eavValue.Dimensions.filter(d => !validDimensions.includes(d.Value)),
              } satisfies EavValue<any>;
        })
      };
    } else if (value.Dimensions.length === 1) {
      // if only one dimension exists delete value and dimension
      newAttribute = {
        ...oldAttributes[attributeKey],
        Values: oldAttributes[attributeKey].Values.filter(eavValue => {
          const dimensionExists = eavValue.Dimensions.some(d => validDimensions.includes(d.Value));
          return !dimensionExists;
        })
      };
    }

    const newAttributes = this.#updateAttribute(oldAttributes, attributeKey, newAttribute);
    return newAttributes;
  }

}