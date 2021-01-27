import { Entity1 } from '.';
import { EavHeader, EavItem } from '../eav';

export class Item1 {
  public Entity: Entity1;
  public Header: EavHeader;

  public static convert(item: EavItem): Item1 {
    const entity1 = Entity1.convertOne(item.Entity);

    const item1: Item1 = {
      Entity: entity1,
      Header: item.Header,
    };
    return item1;
  }
}
