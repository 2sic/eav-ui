import { ICellRendererParams } from '@ag-grid-community/core';

import { WebApi } from './web-api.model';

export interface WebApiActionsParams extends ICellRendererParams {
  onOpenCode(view: WebApi): void;
  onDelete(view: WebApi): void;
}
