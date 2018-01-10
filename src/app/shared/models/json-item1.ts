import { Entity } from './entity';
import { JsonHeader } from './json-header';

export class JsonItem1 {
    public jsonHeader: JsonHeader;
    public entity: Entity;
    constructor(jsonHeader: JsonHeader, entity: Entity) {
        this.jsonHeader = jsonHeader;
        this.entity = entity;
    }
}
