import { ICellRendererParams } from '@ag-grid-community/core';

import { ContentType } from './content-type.model';

export interface DataFieldsParams extends ICellRendererParams {
  onEditFields(contentType: ContentType): void;
}
