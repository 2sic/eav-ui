import { EavAttributesDto } from '.';
import { EavEntity, EavFor, EavType } from '../eav';

/**
 * A JSON representation of an EavEntity.
 * This is a DTO (Data Transfer Object).
 */
export class EavEntityDto {
  Attributes: EavAttributesDto;
  Guid: string;
  Id: number;
  Owner: string;
  Type: EavType;
  Version: number;
  For?: EavFor;
  Metadata?: EavEntityDto[];

  static eavToDto(entity: EavEntity): EavEntityDto {
    const attributesDto = EavAttributesDto.eavToDto(entity.Attributes);
    const metadataDto = this.eavToDtoMany(entity.Metadata);

    const entityDto: EavEntityDto = {
      Attributes: attributesDto,
      Guid: entity.Guid,
      Id: entity.Id,
      Owner: entity.Owner,
      Type: entity.Type,
      Version: entity.Version,
      For: entity.For,
      Metadata: metadataDto,
    };
    return entityDto;
  }

  private static eavToDtoMany(entities: EavEntity[]): EavEntityDto[] {
    if (entities == null)
      return null;

    const result = entities.map(e => EavEntityDto.eavToDto(e));
    return result;
  }
}
