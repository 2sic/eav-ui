import { EavEntity, EavHeader } from '.';
import { Item1 } from '../json-format-v1';

export class EavItem {
  Entity: EavEntity;
  Header: EavHeader;

  static convert(item1: Item1): EavItem {
    const entity = EavEntity.convertOne(item1.Entity);

    const item: EavItem = {
      Entity: entity,
      Header: item1.Header,
    };
    return item;
  }
}
