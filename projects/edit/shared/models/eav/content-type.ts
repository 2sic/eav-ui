import { ContentTypeDef } from './content-type-def';
import { EavHeader } from './eav-header';
import { JsonHeader1 } from '../json-format-v1';

export class ContentType {
  header: EavHeader;
  contentType: ContentTypeDef;

  constructor(header: EavHeader, contentType: ContentTypeDef) {
    this.header = header;
    this.contentType = contentType;
  }

  /** Create new ContentType from json typed JsonContentType */
  public static create(contentType: any): ContentType {
    return new ContentType(
      // TODO: finish content type header from load
      EavHeader.create(new JsonHeader1(1, '', '', null, null, null, '', null)),
      ContentTypeDef.create(contentType)
    );
  }
}
