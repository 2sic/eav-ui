import { ContentType } from '../../models/content-type.model';

export interface DataFieldsParams {
  onEditFields(contentType: ContentType): void;
}
