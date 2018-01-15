import { ContentType1 } from './content-type1';
import { Entity1 } from './entity1';
import { JsonHeader1 } from './json-header1';

export class JsonPackage1 {
    public _: JsonHeader1;
    public ContentType?: ContentType1;
    // public EntityType?: Entity1;

    constructor(_: JsonHeader1, ContentType?: ContentType1) {
        this._ = _;
        this.ContentType = ContentType;
    }
    /*  constructor(_: JsonHeader1, ContentType?: ContentType1, EntityType?: Entity1) {
         this._ = _;
         this.ContentType = ContentType;
         this.EntityType = EntityType;
     } */

    public static create(item: JsonPackage1): JsonPackage1 {
        item._ = JsonHeader1.create(item._);
        item.ContentType = ContentType1.create(item.ContentType);
        return new JsonPackage1(item._, item.ContentType);
    }
}
