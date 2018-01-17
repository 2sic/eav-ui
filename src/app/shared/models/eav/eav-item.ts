import { EavEntity } from './eav-entity';
import { EavHeader } from './eav-header';
import { JsonHeader1 } from '../json-format-v1/json-header1';
import { JsonItem1 } from '../json-format-v1/json-item1';

export class EavItem {
    public header: EavHeader;
    public entity: EavEntity;

    constructor(header: EavHeader, entity: EavEntity) {
        this.header = header;
        this.entity = entity;
    }

    /**
     * Create new Eav Item from json typed JsonItem1
     * @param item
     */
    public static create(item: JsonItem1): EavItem {
        return new EavItem(
            EavHeader.create(item._),
            EavEntity.create(item.Entity)
        );
    }
}


