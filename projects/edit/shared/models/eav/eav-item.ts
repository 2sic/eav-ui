import { EavEntity, EavHeader } from '.';
import { JsonItem1 } from '../json-format-v1';

export class EavItem {
  constructor(public Entity: EavEntity, public Header: EavHeader) { }

  public static create(item: JsonItem1): EavItem {
    return new EavItem(EavEntity.convertOne(item.Entity), item.Header);
  }
}
