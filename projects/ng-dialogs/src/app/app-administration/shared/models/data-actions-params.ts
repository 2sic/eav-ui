import { ICellRendererParams } from '@ag-grid-community/core';

import { ContentType } from './content-type.model';

export interface DataActionsParams extends ICellRendererParams {
  onEdit(contentType: ContentType): void;
  onCreateOrEditMetadata(contentType: ContentType): void;
  onOpenExport(contentType: ContentType): void;
  onDelete(contentType: ContentType): void;
}
