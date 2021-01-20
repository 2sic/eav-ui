import { AttributeDef1 } from '../json-format-v1/attribute-def1';
import { EavAttributes } from './eav-attributes';
import { EavEntity } from './eav-entity';

export class EavAttributeDef {
  name: string;
  type: string;
  inputType: string;
  isTitle: boolean;
  settings: EavAttributes;
  metadata: EavEntity[];

  constructor(name: string, type: string, inputType: string, isTitle: boolean, metadata: EavEntity[], settings: EavAttributes) {
    this.name = name;
    this.type = type;
    this.inputType = inputType;
    this.isTitle = isTitle;
    this.settings = settings;
    this.metadata = metadata;
  }

  /** Create new AttributeDef from json typed AttributeDef1 */
  public static create(item: AttributeDef1): EavAttributeDef {
    const metaDataArray = EavEntity.createArray(item.Metadata);
    const settings = EavAttributes.getFromEavEntityArray(metaDataArray);
    return new EavAttributeDef(item.Name, item.Type, item.InputType, item.IsTitle, metaDataArray, settings);
  }

  /** Create new AttributeDef[] from json typed AttributeDef1[] */
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
