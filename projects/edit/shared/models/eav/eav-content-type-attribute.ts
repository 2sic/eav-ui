import { EavAttributes, EavEntity } from '.';
import { ContentTypeAttribute1 } from '../json-format-v1';

export class EavAttributeDef {
  public InputType: string;
  public IsTitle: boolean;
  public Metadata: EavEntity[];
  public Name: string;
  public Settings: EavAttributes;
  public Type: string;

  private static convertOne(attribute1: ContentTypeAttribute1): EavAttributeDef {
    const metadata = EavEntity.convertMany(attribute1.Metadata);
    const settings = EavAttributes.mergeSettings(metadata);

    const attributeDef: EavAttributeDef = {
      InputType: attribute1.InputType,
      IsTitle: attribute1.IsTitle,
      Metadata: metadata,
      Name: attribute1.Name,
      Settings: settings,
      Type: attribute1.Type,
    };
    return attributeDef;
  }

  public static convertMany(attributes1: ContentTypeAttribute1[]): EavAttributeDef[] {
    if (attributes1 == null) { return []; }

    const attributeDefs = attributes1.map(attribute1 => EavAttributeDef.convertOne(attribute1));
    return attributeDefs;
  }
}
