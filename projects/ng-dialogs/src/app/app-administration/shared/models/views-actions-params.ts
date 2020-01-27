import { ICellRendererParams } from '@ag-grid-community/core';

import { View } from './view.model';

export interface ViewsActionsParams extends ICellRendererParams {
  onDelete(view: View): void;
}
