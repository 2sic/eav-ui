import { ICellRendererParams } from '@ag-grid-community/core';

import { View } from '../../models/view.model';

export interface ViewActionsParams extends ICellRendererParams {
  onOpenCode(view: View): void;
  onOpenPermissions(view: View): void;
  onDelete(view: View): void;
}
