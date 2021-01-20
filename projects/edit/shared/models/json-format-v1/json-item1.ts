import { Entity1 } from '.';
import { EavHeader, Item } from '../eav';

export class JsonItem1 {
  constructor(
    public Entity: Entity1,
    public Header: EavHeader,
  ) { }

  public static create(item: Item): JsonItem1 {
    return new JsonItem1(
      Entity1.create(item.Entity),
      item.Header,
    );
  }
}
