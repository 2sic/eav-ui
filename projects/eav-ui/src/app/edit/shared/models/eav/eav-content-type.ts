import { EavContentTypeAttribute, EavEntity, EavEntityAttributes } from '.';
import { EavContentTypeDto } from '../json-format-v1';

export class EavContentType {
  Attributes: EavContentTypeAttribute[];
  Description: string;
  Id: string;
  Metadata: EavEntity[];
  Name: string;
  Scope: string;
  Settings: EavEntityAttributes;

  static convertOne(contentTypeDto: EavContentTypeDto): EavContentType {
    const attributes = EavContentTypeAttribute.convertMany(contentTypeDto.Attributes);
    const metadata = EavEntity.convertMany(contentTypeDto.Metadata);
    const settings = EavEntityAttributes.mergeSettings(metadata);

    const contentType: EavContentType = {
      Attributes: attributes,
      Description: contentTypeDto.Description,
      Id: contentTypeDto.Id,
      Metadata: metadata,
      Name: contentTypeDto.Name,
      Scope: contentTypeDto.Scope,
      Settings: settings,
    };
    return contentType;
  }

  static convertMany(contentTypesDto: EavContentTypeDto[]): EavContentType[] {
    if (contentTypesDto == null) { return null; }

    const contentTypes = contentTypesDto.map(contentTypeDto => EavContentType.convertOne(contentTypeDto));
    return contentTypes;
  }
}
