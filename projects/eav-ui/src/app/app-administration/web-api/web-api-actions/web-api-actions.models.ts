import { WebApi } from '../../models/web-api.model';

export interface WebApiActionsParams {
  enableCodeGetter(): boolean;
  onOpenCode(api: WebApi): void;
  onOpenRestApi(api: WebApi): void;
}
