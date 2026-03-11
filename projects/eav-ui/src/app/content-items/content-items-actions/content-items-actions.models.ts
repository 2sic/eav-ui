import { ContentItem } from '../models/content-item.model';

export type ContentItemsActionVerb = 'clone' | 'export' | 'delete';

export interface ContentItemsActionsParams {
  do(verb: ContentItemsActionVerb, item: ContentItem): void;
  urlTo(verb: ContentItemsActionVerb, item: ContentItem): string;
}