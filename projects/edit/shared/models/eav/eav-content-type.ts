import { EavContentTypeAttribute, EavEntity, EavEntityAttributes } from '.';
import { ContentType1 } from '../json-format-v1';

export class EavContentType {
  Attributes: EavContentTypeAttribute[];
  Description: string;
  Id: string;
  Metadata: EavEntity[];
  Name: string;
  Scope: string;
  Settings: EavEntityAttributes;

  static convert(contentType1: ContentType1): EavContentType {
    const attributes = EavContentTypeAttribute.convertMany(contentType1.Attributes);
    const metadata = EavEntity.convertMany(contentType1.Metadata);
    const settings = EavEntityAttributes.mergeSettings(metadata);

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
