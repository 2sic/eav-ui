import { Entity1 } from '.';
import { EavHeader, EavItem } from '../eav';

export class Item1 {
  constructor(public Entity: Entity1, public Header: EavHeader) { }

  public static create(item: EavItem): Item1 {
    return new Item1(Entity1.create(item.Entity), item.Header);
  }
}
