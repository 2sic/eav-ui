import { EavEntity } from './eav-entity';
import { EavHeader } from './eav-header';
import { JsonItem1 } from '../json-format-v1/json-item1';

export class Item {
  header: EavHeader;
  entity: EavEntity;

  constructor(header: EavHeader, entity: EavEntity) {
    this.header = header;
    this.entity = entity;
  }

  /** Create new Eav Item from json typed JsonItem1 */
  public static create(item: JsonItem1): Item {
    console.log('create item.Entity:', item.Entity);
    return new Item(
      EavHeader.create(item.Header),
      EavEntity.create(item.Entity)
    );
  }
}
