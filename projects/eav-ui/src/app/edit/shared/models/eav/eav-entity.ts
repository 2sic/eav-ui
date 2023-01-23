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

  static convertOne(entityDto: EavEntityDto): EavEntity {
    const attributes = EavEntityAttributes.convert(entityDto.Attributes);
    const metadata = this.convertMany(entityDto.Metadata);

    const entity: EavEntity = {
      Attributes: attributes,
      Guid: entityDto.Guid,
      Id: entityDto.Id,
      Owner: entityDto.Owner,
      Type: entityDto.Type,
      Version: entityDto.Version,
      For: entityDto.For,
      Metadata: metadata,
    };
    return entity;
  }

  static convertMany(entitiesDto: EavEntityDto[]): EavEntity[] {
    if (entitiesDto == null) { return null; }

    const entities = entitiesDto.map(entityDto => EavEntity.convertOne(entityDto));
    return entities;
  }
}
