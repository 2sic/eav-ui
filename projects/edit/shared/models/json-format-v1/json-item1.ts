import { EavHeader } from '../eav';
import { Item } from '../eav/item';
import { Entity1 } from './entity1';

export class JsonItem1 {
  Header: EavHeader;
  Entity: Entity1;

  constructor(Header: EavHeader, Entity: Entity1) {
    this.Header = Header;
    this.Entity = Entity;
  }

  public static create(item: Item): JsonItem1 {
    return new JsonItem1(
      item.header,
      Entity1.create(item.entity)
    );
  }
}
