import { EavEntity, EavHeader } from '.';
import { JsonItem1 } from '../json-format-v1';

export class Item {
  constructor(
    public Entity: EavEntity,
    public Header: EavHeader,
  ) { }

  public static create(item: JsonItem1): Item {
    return new Item(
      EavEntity.create(item.Entity),
      item.Header,
    );
  }
}
