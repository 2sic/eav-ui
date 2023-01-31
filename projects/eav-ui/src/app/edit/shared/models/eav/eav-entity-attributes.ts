import { EavEntity, EavValues } from '.';
import { EavAttributesDto } from '../json-format-v1';

export class EavEntityAttributes {
  [attributeName: string]: EavValues<any>;

  static convert(attributesDto: EavAttributesDto): EavEntityAttributes {
    const attributes: EavEntityAttributes = {};

    // loop attribute types - String, Boolean, ...
    for (const [typeName, attributeDto] of Object.entries(attributesDto)) {
      // loop attribute names - Description, Name, ...
      for (const [attributeName, valueDto] of Object.entries(attributeDto)) {
        attributes[attributeName] = EavValues.convert(valueDto, typeName);
      }
    }
    return attributes;
  }

  static mergeSettings(metadataItems: EavEntity[]): EavEntityAttributes {
    if (metadataItems == null) { return {}; }

    const merged: EavEntityAttributes = {};
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
