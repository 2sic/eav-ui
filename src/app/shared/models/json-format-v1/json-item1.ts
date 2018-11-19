import { Entity1 } from './entity1';
import { JsonHeader1 } from './json-header1';
import { Item } from '../eav/item';

export class JsonItem1 {
    Header: JsonHeader1;
    Entity: Entity1;

    constructor(Header: JsonHeader1, Entity: Entity1) {
        this.Header = Header;
        this.Entity = Entity;
    }

    /* public static create(item: JsonItem1): JsonItem1 {
        item._ = JsonHeader1.create(item._);
        item.Entity = Entity1.create(item.Entity);
        return new JsonItem1(item._, item.Entity);
    } */

    /**
     *
     * @param item
     * @param contentTypeAttributes we need attributes for creating type key in entity
     */
    public static create(item: Item): JsonItem1 {
        return new JsonItem1(
            JsonHeader1.create(item.header),
            Entity1.create(item.entity)
        );
    }
}


