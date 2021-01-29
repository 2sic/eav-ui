import { EavAttributes, EavContentTypeAttribute, EavEntity } from '.';
import { ContentType1 } from '../json-format-v1';

export class EavContentType {
  public Attributes: EavContentTypeAttribute[];
  public Description: string;
  public Id: string;
  public Metadata: EavEntity[];
  public Name: string;
  public Scope: string;
  public Settings: EavAttributes;

  public static convert(contentType1: ContentType1): EavContentType {
    const attributes = EavContentTypeAttribute.convertMany(contentType1.Attributes);
    const metadata = EavEntity.convertMany(contentType1.Metadata);
    const settings = EavAttributes.mergeSettings(metadata);

    const contentType: EavContentType = {
      Attributes: attributes,
      Description: contentType1.Description,
      Id: contentType1.Id,
      Metadata: metadata,
      Name: contentType1.Name,
      Scope: contentType1.Scope,
      Settings: settings,
    };
    return contentType;
  }
}
