import { ICellRendererParams } from '@ag-grid-community/core';

import { WebApi } from '../../models/web-api.model';

export interface WebApiActionsParams extends ICellRendererParams {
  onOpenCode(view: WebApi): void;
  onDelete(view: WebApi): void;
}
