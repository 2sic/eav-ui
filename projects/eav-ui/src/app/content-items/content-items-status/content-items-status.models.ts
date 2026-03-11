import { ContentItem } from '../models/content-item.model';

export type ContentItemsStatusVerb = 'metadata';

export interface ContentItemsStatusParams {
  urlTo(verb: ContentItemsStatusVerb, item: ContentItem): string;
}