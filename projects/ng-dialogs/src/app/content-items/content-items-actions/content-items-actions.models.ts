import { ContentItem } from '../models/content-item.model';

export interface ContentItemsActionsParams {
  onClone(item: ContentItem): void;
  onExport(item: ContentItem): void;
  onDelete(item: ContentItem): void;
}
