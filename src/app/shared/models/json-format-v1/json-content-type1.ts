import { ContentTypeDef1 } from './content-type-def1';
import { JsonHeader1 } from './json-header1';

export class JsonContentType1 {
    _: JsonHeader1;
    ContentType: ContentTypeDef1;

    constructor(_: JsonHeader1, ContentType: ContentTypeDef1) {
        this._ = _;
        this.ContentType = ContentType;
    }

    /* public static create(item: JsonContentType1): JsonContentType1 {
        item._ = JsonHeader1.create(item._);
        item.ContentType = ContentType1.create(item.ContentType);
        return new JsonContentType1(item._, item.ContentType);
    } */
}
