import { ContentType1 } from '../json-format-v1/content-type-def1';
import { AttributeDef } from './attribute-def';
import { EavAttributes } from './eav-attributes';
import { EavEntity } from './eav-entity';

export class ContentType {
  attributes: AttributeDef[];
  description: string;
  id: string;
  metadata: EavEntity[];
  name: string;
  scope: string;
  settings: EavAttributes;

  constructor(
    id: string,
    name: string,
    scope: string,
    description: string,
    attributes: AttributeDef[],
    metadata: EavEntity[],
    settings: EavAttributes,
  ) {
    this.id = id;
    this.name = name;
    this.scope = scope;
    this.description = description;
    this.attributes = attributes;
    this.metadata = metadata;
    this.settings = settings;
  }

  /** Create ContentType from json typed ContentType1 */
  public static create(item: ContentType1): ContentType {
    const attributeDefArray = AttributeDef.createArray(item.Attributes);
    const metaDataArray = EavEntity.createArray(item.Metadata);
    const settings = EavAttributes.getFromEavEntityArray(metaDataArray);

    return new ContentType(item.Id, item.Name, item.Scope, item.Description, attributeDefArray, metaDataArray, settings);
  }
}
