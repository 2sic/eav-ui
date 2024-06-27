import { ContentItem } from '../models/content-item.model';

export type ContentItemType = 'clone' | 'export' | 'delete';
export interface ContentItemsActionsParams {
  do(verb: ContentItemType, item: ContentItem): void;
}
