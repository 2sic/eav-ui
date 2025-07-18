import { EavEntityAttributes, EavFor, EavType } from '.';
import { EavEntityDto } from '../json-format-v1';

export class EavEntity {
  Attributes: EavEntityAttributes;
  Guid: string;
  Id: number;
  Owner: string;
  Type: EavType;
  Version: number;
  For?: EavFor;
  Metadata?: EavEntity[];

  static dtoToEav(entityDto: EavEntityDto): EavEntity {
    const attributes = EavEntityAttributes.dtoToEav(entityDto.Attributes);
    const metadata = this.dtoToEavMany(entityDto.Metadata);

    const entity: EavEntity = {
      Attributes: attributes,
      Guid: entityDto.Guid,
      Id: entityDto.Id,
      Owner: entityDto.Owner,
      Type: entityDto.Type,
      Version: entityDto.Version,
      For: entityDto.For ?? null,
      Metadata: metadata,
    };
    return entity;
  }

  static dtoToEavMany(entitiesDto: EavEntityDto[]): EavEntity[] {
    if (entitiesDto == null)
      return null;

    const entities = entitiesDto.map(e => EavEntity.dtoToEav(e));
    return entities;
  }
}
