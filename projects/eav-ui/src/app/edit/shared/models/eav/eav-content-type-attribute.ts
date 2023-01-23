import { EavEntity, EavEntityAttributes } from '.';
import { EavContentTypeAttributesDto } from '../json-format-v1';

export class EavContentTypeAttribute {
  InputType: string;
  IsTitle: boolean;
  Metadata: EavEntity[];
  Name: string;
  Settings: EavEntityAttributes;
  Type: string;

  private static convertOne(ctAttributeDto: EavContentTypeAttributesDto): EavContentTypeAttribute {
    const metadata = EavEntity.convertMany(ctAttributeDto.Metadata);
    const settings = EavEntityAttributes.mergeSettings(metadata);

    const attribute: EavContentTypeAttribute = {
      InputType: ctAttributeDto.InputType,
      IsTitle: ctAttributeDto.IsTitle,
      Metadata: metadata,
      Name: ctAttributeDto.Name,
      Settings: settings,
      Type: ctAttributeDto.Type,
    };
    return attribute;
  }

  static convertMany(ctAttributesDto: EavContentTypeAttributesDto[]): EavContentTypeAttribute[] {
    if (ctAttributesDto == null) { return []; }

    const attributes = ctAttributesDto.map(attribute1 => EavContentTypeAttribute.convertOne(attribute1));
    return attributes;
  }
}
