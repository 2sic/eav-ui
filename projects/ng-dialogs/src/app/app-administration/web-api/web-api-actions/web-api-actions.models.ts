import { ICellRendererParams } from '@ag-grid-community/core';
import { WebApi } from '../../models/web-api.model';

export interface WebApiActionsParams extends ICellRendererParams {
  enableCodeGetter(): boolean;
  onOpenCode(api: WebApi): void;
  onOpenRestApi(api: WebApi): void;
}
