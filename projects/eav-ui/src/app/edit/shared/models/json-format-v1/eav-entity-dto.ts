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

  static entityToDto(entity: EavEntity): EavEntityDto {
    const attributesDto = EavAttributesDto.attributesToDto(entity.Attributes);
    const metadataDto = this.entitiesToDto(entity.Metadata);

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

  private static entitiesToDto(entities: EavEntity[]): EavEntityDto[] {
    if (entities == null) { return null; }

    const entities1 = entities.map(entity => EavEntityDto.entityToDto(entity));
    return entities1;
  }
}
