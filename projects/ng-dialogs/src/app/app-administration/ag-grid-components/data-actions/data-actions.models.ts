import { ICellRendererParams } from '@ag-grid-community/core';

import { ContentType } from '../../models/content-type.model';

export interface DataActionsParams extends ICellRendererParams {
  enablePermissionsGetter(): boolean;
  onCreateOrEditMetadata(contentType: ContentType): void;
  onOpenPermissions(contentType: ContentType): void;
  onEdit(contentType: ContentType): void;
  onOpenExport(contentType: ContentType): void;
  onOpenImport(contentType: ContentType): void;
  onDelete(contentType: ContentType): void;
}
