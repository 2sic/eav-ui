import { ContentType } from './content-type';
import { JsonHeader } from './json-header';

export class JsonContentType1 {
    public jsonHeader: JsonHeader;
    public contentType: ContentType;
    constructor(jsonHeader: JsonHeader, contentType: ContentType) {
        this.jsonHeader = jsonHeader;
        this.contentType = contentType;
    }
}
