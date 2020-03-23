import { EavValues } from './eav-values';
import { Attributes1 } from '../json-format-v1/attributes1';
import { EavValue } from './eav-value';
import { EavEntity } from './eav-entity';

export class EavAttributes {
  [key: string]: EavValues<any>;

  /** Create Eav Attributes from json typed Attributes1 */
  public static create<T>(attributes1: Attributes1<T>): EavAttributes {
    const newEavAtribute: EavAttributes = new EavAttributes();

    // Loop trough attributes types - String, Boolean ...
    Object.keys(attributes1).forEach(attributes1Key => {
      if (attributes1.hasOwnProperty(attributes1Key)) {
        const attribute1 = attributes1[attributes1Key];
        // Loop trough attribute - Description, Name ...
        Object.keys(attribute1).forEach(attribute1Key => {
          if (attribute1.hasOwnProperty(attribute1Key)) {
            // Creates new EavValue for specified type
            newEavAtribute[attribute1Key] = EavValues.create<T>(attribute1[attribute1Key], attributes1Key);
          }
        });
      }
    });
    console.log('created attributes: ', newEavAtribute);
    return newEavAtribute;
  }

  /**
   * Get all attributes (dictionary) from attributs in EavEntity array (all attributs from each entity in array).
   * Example: Settings from metadata array
   */
  public static getFromEavEntityArray(metadataArray: EavEntity[]): EavAttributes {
    const mergedSettings: EavAttributes = new EavAttributes();
    if (metadataArray !== undefined) {
      // First read all metadata settings witch are not @All
      metadataArray.forEach(mdItem => {
        if (mdItem.type.id !== '@All') {
          Object.keys(mdItem.attributes).forEach(attributeKey => {
            mergedSettings[attributeKey] = Object.assign({}, mdItem.attributes[attributeKey]);
          });
        }
      });
      // Read @All metadata settings last (to rewrite attribute if attribute with same name exist)
      metadataArray.forEach(mdItem => {
        if (mdItem.type.id === '@All') {
          Object.keys(mdItem.attributes).forEach(attributeKey => {
            // Add @All.Property value, but skip if both empty and already exists
            // So don't overwrite existing values with empty
            const newIsEmpty = mdItem.attributes[attributeKey].values[0].value === '';
            const previousExists = mergedSettings[attributeKey];
            const skip = newIsEmpty && previousExists;
            if (!skip) {
              mergedSettings[attributeKey] = Object.assign({}, mdItem.attributes[attributeKey]);
            }
          });
        }
      });
    }
    return mergedSettings;
  }

  /** Create EavAtributes from dictionary */
  public static createFromDictionary = (value: { [key: string]: any }): EavAttributes => {
    const eavAttributes: EavAttributes = new EavAttributes();
    Object.keys(value).forEach(valueKey => {
      eavAttributes[valueKey] = new EavValues([new EavValue(value[valueKey], [])], 'String');
    });
    return eavAttributes;
  }
}
