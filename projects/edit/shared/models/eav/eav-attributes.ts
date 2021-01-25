import { EavEntity, EavValues } from '.';
import { Attributes1 } from '../json-format-v1';

export class EavAttributes {
  [key: string]: EavValues<any>;

  public static create(attributes1: Attributes1): EavAttributes {
    const newEavAtribute: EavAttributes = new EavAttributes();

    // Loop trough attributes types - String, Boolean ...
    Object.keys(attributes1).forEach(attributes1Key => {
      const attribute1 = attributes1[attributes1Key];
      // Loop trough attribute - Description, Name ...
      Object.keys(attribute1).forEach(attribute1Key => {
        // Creates new EavValue for specified type
        newEavAtribute[attribute1Key] = EavValues.create(attribute1[attribute1Key], attributes1Key);
      });
    });
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
        if (mdItem.Type.Id !== '@All') {
          Object.keys(mdItem.Attributes).forEach(attributeKey => {
            const attributeCopy: EavValues<any> = { ...mdItem.Attributes[attributeKey] };
            mergedSettings[attributeKey] = attributeCopy;
          });
        }
      });
      // Read @All metadata settings last (to rewrite attribute if attribute with same name exist)
      metadataArray.forEach(mdItem => {
        if (mdItem.Type.Id === '@All') {
          Object.keys(mdItem.Attributes).forEach(attributeKey => {
            // Add @All.Property value, but skip if both empty and already exists
            // So don't overwrite existing values with empty
            const newIsEmpty = mdItem.Attributes[attributeKey].Values[0].Value === '';
            const previousExists = mergedSettings[attributeKey];
            const skip = newIsEmpty && previousExists;
            if (!skip) {
              const attributeCopy: EavValues<any> = { ...mdItem.Attributes[attributeKey] };
              mergedSettings[attributeKey] = attributeCopy;
            }
          });
        }
      });
    }
    return mergedSettings;
  }
}
