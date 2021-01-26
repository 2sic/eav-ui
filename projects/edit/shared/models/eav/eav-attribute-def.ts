import { EavAttributes, EavEntity } from '.';
import { AttributeDef1 } from '../json-format-v1';

export class EavAttributeDef {
  public InputType: string;
  public IsTitle: boolean;
  public Metadata: EavEntity[];
  public Name: string;
  public Settings: EavAttributes;
  public Type: string;

  public static convertOne(attributeDef1: AttributeDef1): EavAttributeDef {
    const metadata = EavEntity.createArray(attributeDef1.Metadata);
    const settings = EavAttributes.mergeSettings(metadata);

    const attributeDef: EavAttributeDef = {
      InputType: attributeDef1.InputType,
      IsTitle: attributeDef1.IsTitle,
      Metadata: metadata,
      Name: attributeDef1.Name,
      Settings: settings,
      Type: attributeDef1.Type,
    };
    return attributeDef;
  }

  public static convertMany(attributeDefs1: AttributeDef1[]): EavAttributeDef[] {
    if (attributeDefs1 == null) { return []; }

    const attributeDefs = attributeDefs1.map(attributeDef1 => EavAttributeDef.convertOne(attributeDef1));
    return attributeDefs;
  }
}
