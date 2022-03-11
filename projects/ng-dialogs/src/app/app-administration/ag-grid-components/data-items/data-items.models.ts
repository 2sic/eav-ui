import { ICellRendererParams } from '@ag-grid-community/core';
import { ContentType } from '../../models/content-type.model';

export interface DataItemsParams extends ICellRendererParams {
  onShowItems(contentType: ContentType): void;
  onAddItem(contentType: ContentType): void;
}
