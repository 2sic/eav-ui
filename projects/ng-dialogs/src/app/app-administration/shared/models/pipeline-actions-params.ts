import { ICellRendererParams } from '@ag-grid-community/core';

import { Query } from './query.model';

export interface PipelinesActionsParams extends ICellRendererParams {
  onEditPipeline(query: Query): void;
  onOpenPermissions(query: Query): void;
  onDelete(query: Query): void;
}
