import { EavAttributeDef, EavAttributes, EavEntity } from '.';
import { ContentType1 } from '../json-format-v1';

export class EavContentType {
  constructor(
    public Attributes: EavAttributeDef[],
    public Description: string,
    public Id: string,
    public Metadata: EavEntity[],
    public Name: string,
    public Scope: string,
    public Settings: EavAttributes,
  ) { }

  public static create(item: ContentType1): EavContentType {
    const attributeDefArray = EavAttributeDef.convertMany(item.Attributes);
    const metadataArray = EavEntity.createArray(item.Metadata);
    const settings = EavAttributes.mergeSettings(metadataArray);

    return new EavContentType(attributeDefArray, item.Description, item.Id, metadataArray, item.Name, item.Scope, settings);
  }
}
