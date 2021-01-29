import { EavEntity, EavEntityAttributes } from '.';
import { ContentTypeAttribute1 } from '../json-format-v1';

export class EavContentTypeAttribute {
  public InputType: string;
  public IsTitle: boolean;
  public Metadata: EavEntity[];
  public Name: string;
  public Settings: EavEntityAttributes;
  public Type: string;

  private static convertOne(attribute1: ContentTypeAttribute1): EavContentTypeAttribute {
    const metadata = EavEntity.convertMany(attribute1.Metadata);
    const settings = EavEntityAttributes.mergeSettings(metadata);

    const attribute: EavContentTypeAttribute = {
      InputType: attribute1.InputType,
      IsTitle: attribute1.IsTitle,
      Metadata: metadata,
      Name: attribute1.Name,
      Settings: settings,
      Type: attribute1.Type,
    };
    return attribute;
  }

  public static convertMany(attributes1: ContentTypeAttribute1[]): EavContentTypeAttribute[] {
    if (attributes1 == null) { return []; }

    const attributes = attributes1.map(attribute1 => EavContentTypeAttribute.convertOne(attribute1));
    return attributes;
  }
}
