import { ContentType1 } from '../json-format-v1';
import { EavAttributeDef } from './eav-attribute-def';
import { EavAttributes } from './eav-attributes';
import { EavEntity } from './eav-entity';

export class EavContentType {
  Attributes: EavAttributeDef[];
  Description: string;
  Id: string;
  Metadata: EavEntity[];
  Name: string;
  Scope: string;
  Settings: EavAttributes;

  constructor(
    id: string,
    name: string,
    scope: string,
    description: string,
    attributes: EavAttributeDef[],
    metadata: EavEntity[],
    settings: EavAttributes,
  ) {
    this.Id = id;
    this.Name = name;
    this.Scope = scope;
    this.Description = description;
    this.Attributes = attributes;
    this.Metadata = metadata;
    this.Settings = settings;
  }

  /** Create ContentType from json typed ContentType1 */
  public static create(item: ContentType1): EavContentType {
    const attributeDefArray = EavAttributeDef.createArray(item.Attributes);
    const metaDataArray = EavEntity.createArray(item.Metadata);
    const settings = EavAttributes.getFromEavEntityArray(metaDataArray);

    return new EavContentType(item.Id, item.Name, item.Scope, item.Description, attributeDefArray, metaDataArray, settings);
  }
}
