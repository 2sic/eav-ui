import { ICellRendererParams } from '@ag-grid-community/core';
import { ContentType } from '../../models/content-type.model';

export interface DataFieldsParams extends ICellRendererParams {
  onEditFields(contentType: ContentType): void;
}
