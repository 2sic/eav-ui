import { ICellRendererParams } from '@ag-grid-community/core';

import { ContentItem } from './content-item.model';

export interface ContentItemsActionsParams extends ICellRendererParams {
  onClone(item: ContentItem): void;
  onExport(item: ContentItem): void;
  onDelete(item: ContentItem): void;
}
