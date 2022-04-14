import { ContentType } from '../../models/content-type.model';

export interface DataItemsParams {
  onShowItems(contentType: ContentType): void;
  onAddItem(contentType: ContentType): void;
}
