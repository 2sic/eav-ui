import { ICellRendererParams } from '@ag-grid-community/core';
import { ContentItem } from '../models/content-item.model';

export interface ContentItemsStatusParams extends ICellRendererParams {
  onOpenMetadata(item: ContentItem): void;
}
