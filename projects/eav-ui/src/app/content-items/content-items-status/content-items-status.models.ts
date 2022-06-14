import { ContentItem } from '../models/content-item.model';

export interface ContentItemsStatusParams {
  onOpenMetadata(item: ContentItem): void;
}
