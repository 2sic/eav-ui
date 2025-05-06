import { EavContentTypeAttribute, EavEntity, EavEntityAttributes } from '.';
import { EavContentTypeDto } from '../json-format-v1';

export class EavContentType {
  Attributes: EavContentTypeAttribute[];
  /** The NameId / Guid of this Content-Type */
  Id: string;
  Metadata: EavEntity[];
  Name: string;
  Scope: string;
  Settings: EavEntityAttributes;

  /** WIP v18.02 */
  Title: string;

  static dtoToEav(contentTypeDto: EavContentTypeDto): EavContentType {
    const attributes = EavContentTypeAttribute.dtoToEavMany(contentTypeDto.Attributes);
    const metadata = EavEntity.dtoToEavMany(contentTypeDto.Metadata);
    const settings = EavEntityAttributes.mergeSettings(metadata);

    const contentType: EavContentType = {
      Attributes: attributes,
      Id: contentTypeDto.Id,
      Metadata: metadata,
      Name: contentTypeDto.Name,
      Scope: contentTypeDto.Scope,
      Settings: settings,
      Title: contentTypeDto.Title,
    };
    return contentType;
  }

  static dtoToEavMany(contentTypesDto: EavContentTypeDto[]): EavContentType[] {
    if (contentTypesDto == null)
      return null;

    const result = contentTypesDto.map(ct => EavContentType.dtoToEav(ct));
    return result;
  }
}
