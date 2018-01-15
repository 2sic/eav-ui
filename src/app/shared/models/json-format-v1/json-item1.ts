import { Entity1 } from './entity1';
import { JsonHeader1 } from './json-header1';

export class JsonItem1 {
    public _: JsonHeader1;
    public Entity: Entity1;

    constructor(_: JsonHeader1, Entity: Entity1) {
        this._ = _;
        this.Entity = Entity;
    }

    public static create(item: JsonItem1): JsonItem1 {
        item._ = JsonHeader1.create(item._);
        item.Entity = Entity1.create(item.Entity);
        return new JsonItem1(item._, item.Entity);
    }
}


