import { ContentTypeDef } from './content-type-def';
import { EavHeader } from './eav-header';
import { JsonContentType1 } from '../json-format-v1/json-content-type1';
import { JsonHeader1 } from '../json-format-v1';

export class ContentType {
    header: EavHeader;
    contentType: ContentTypeDef;

    constructor(header: EavHeader, contentType: ContentTypeDef) {
        this.header = header;
        this.contentType = contentType;
    }

    /**
     * Create new ContentType from json typed JsonContentType
     * @param item
     */
    public static create(contentType: any): ContentType {
        return new ContentType(
            // EavHeader.create(item._),
            EavHeader.create(new JsonHeader1(1)),
            ContentTypeDef.create(contentType)
        );
    }
}


