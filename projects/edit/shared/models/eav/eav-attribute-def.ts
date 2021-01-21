import { EavAttributes, EavEntity } from '.';
import { AttributeDef1 } from '../json-format-v1';

export class EavAttributeDef {
  constructor(
    public InputType: string,
    public IsTitle: boolean,
    public Metadata: EavEntity[],
    public Name: string,
    public Settings: EavAttributes,
    public Type: string,
  ) { }

  public static create(item: AttributeDef1): EavAttributeDef {
    const metadataArray = EavEntity.createArray(item.Metadata);
    const settings = EavAttributes.getFromEavEntityArray(metadataArray);
    return new EavAttributeDef(item.InputType, item.IsTitle, metadataArray, item.Name, settings, item.Type);
  }

  public static createArray(attributeDef1Array: AttributeDef1[]): EavAttributeDef[] {
    const attributeDefArray: EavAttributeDef[] = [];
    if (attributeDef1Array !== undefined) {
      attributeDef1Array.forEach(attributeDef1 => {
        attributeDefArray.push(EavAttributeDef.create(attributeDef1));
      });
    }
    return attributeDefArray;
  }
}
