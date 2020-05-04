import { ICellRendererParams } from '@ag-grid-community/core';

import { Query } from './query.model';

export interface PipelinesActionsParams extends ICellRendererParams {
  onEditQuery(query: Query): void;
  onCloneQuery(query: Query): void;
  onOpenPermissions(query: Query): void;
  onExportQuery(query: Query): void;
  onDelete(query: Query): void;
}
