import { Entity1 } from './entity1';
// import { JsonHeader1 } from './json-header1';
import { Item } from '../eav/item';
import { EavHeader } from '../eav';

export class JsonItem1 {
  // Header: JsonHeader1;
  Header: EavHeader;
  Entity: Entity1;

  constructor(Header: EavHeader, Entity: Entity1) {
    this.Header = Header;
    this.Entity = Entity;
  }

  public static create(item: Item): JsonItem1 {
    return new JsonItem1(
      // JsonHeader1.create(item.header),
      item.header,
      Entity1.create(item.entity)
    );
  }
}
