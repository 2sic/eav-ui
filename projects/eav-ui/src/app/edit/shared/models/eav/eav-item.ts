import { EavEntity, EavHeader } from '.';
import { EavEntityBundleDto } from '../json-format-v1';

export class EavItem {
  Entity: EavEntity;
  Header: EavHeader;

  static convert(entityBundleDto: EavEntityBundleDto): EavItem {
    const entity = EavEntity.convertOne(entityBundleDto.Entity);

    const item: EavItem = {
      Entity: entity,
      Header: entityBundleDto.Header,
    };
    return item;
  }
}
