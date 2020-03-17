import { ICellRendererParams } from '@ag-grid-community/core';

import { ContentType } from './content-type.model';

export interface DataItemsParams extends ICellRendererParams {
  onAddItem(contentType: ContentType): void;
}
