import { EavEntity, EavValues } from '.';
import { EntityAttributes1 } from '../json-format-v1';

export class EavAttributes {
  [attributeName: string]: EavValues<any>;

  public static convert(attributes1: EntityAttributes1): EavAttributes {
    const atributes: EavAttributes = {};

    // loop attribute types - String, Boolean, ...
    for (const [type1, attribute1] of Object.entries(attributes1)) {
      // loop attribute names - Description, Name, ...
      for (const [name1, value1] of Object.entries(attribute1)) {
        atributes[name1] = EavValues.convert(value1, type1);
      }
    }
    return atributes;
  }

  public static mergeSettings(metadataItems: EavEntity[]): EavAttributes {
    if (metadataItems == null) { return {}; }

    const merged: EavAttributes = {};
    // copy metadata settings which are not @All
    for (const item of metadataItems) {
      if (item.Type.Id === '@All') { continue; }

      for (const [name, value] of Object.entries(item.Attributes)) {
        const copy: EavValues<any> = { ...value };
        merged[name] = copy;
      }
    }

    // copy @All metadata settings, overwriting previous settings
    for (const item of metadataItems) {
      if (item.Type.Id !== '@All') { continue; }

      for (const [name, value] of Object.entries(item.Attributes)) {
        // do not overwrite previous settings if @All is empty
        const exists = merged[name] != null;
        const emptyAll = value.Values[0].Value === '';
        if (exists && emptyAll) { continue; }

        const copy: EavValues<any> = { ...value };
        merged[name] = copy;
      }
    }
    return merged;
  }
}
