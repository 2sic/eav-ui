import { ICellRendererParams } from '@ag-grid-community/core';

import { Query } from '../../models/query.model';

export interface QueriesActionsParams extends ICellRendererParams {
  showPermissionsGetter(): boolean;
  onEditQuery(query: Query): void;
  onCloneQuery(query: Query): void;
  onOpenPermissions(query: Query): void;
  onExportQuery(query: Query): void;
  onDelete(query: Query): void;
}
