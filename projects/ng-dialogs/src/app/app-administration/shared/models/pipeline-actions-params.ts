import { ICellRendererParams } from '@ag-grid-community/core';

import { Query } from './query.model';

export interface PipelinesActionsParams extends ICellRendererParams {
  onOpenPermissions(query: Query): void;
  onDelete(query: Query): void;
}
