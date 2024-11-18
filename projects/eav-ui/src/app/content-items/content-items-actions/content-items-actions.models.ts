import { ContentItem } from '../models/content-item.model';

export type ContentItemType = 'export' | 'delete';
export interface ContentItemsActionsParams {
  do(verb: ContentItemType, item: ContentItem): void;
  urlTo(verb: ContentItemType, item: ContentItem): string;
}
