import { ICellRendererParams } from '@ag-grid-community/core';

import { WebApi } from '../../models/web-api.model';

export interface WebApiActionsParams extends ICellRendererParams {
  showCodeGetter(): boolean;
  onOpenCode(view: WebApi): void;
}
