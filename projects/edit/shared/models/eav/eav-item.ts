import { EavEntity, EavHeader } from '.';
import { Item1 } from '../json-format-v1';

export class EavItem {
  public Entity: EavEntity;
  public Header: EavHeader;

  public static convert(item1: Item1): EavItem {
    const item: EavItem = {
      Entity: EavEntity.convertOne(item1.Entity),
      Header: item1.Header,
    };
    return item;
  }
}
