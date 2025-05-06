import { EavEntity, EavEntityAttributes } from '.';
import { Of } from '../../../../../../../core';
import { InputTypeCatalog } from '../../../../shared/fields/input-type-catalog';
import { EavContentTypeAttributesDto } from '../json-format-v1';

export class EavContentTypeAttribute {
  InputType: Of<typeof InputTypeCatalog>;
  IsTitle: boolean;
  Metadata: EavEntity[];
  Name: string;
  Settings: EavEntityAttributes;
  Type: string;

  private static dtoToEav(ctAttributeDto: EavContentTypeAttributesDto): EavContentTypeAttribute {
    const metadata = EavEntity.dtoToEavMany(ctAttributeDto.Metadata);
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

  static dtoToEavMany(ctAttributesDto: EavContentTypeAttributesDto[]): EavContentTypeAttribute[] {
    if (ctAttributesDto == null)
      return [];

    const attributes = ctAttributesDto.map(a => EavContentTypeAttribute.dtoToEav(a));
    return attributes;
  }
}
