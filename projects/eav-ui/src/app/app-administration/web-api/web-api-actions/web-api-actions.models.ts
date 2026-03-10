import { WebApi } from '../../models/web-api.model';

export type WebApiActionsVerb = 'code' | 'restApi';

export interface WebApiActionsParams {
  enableCode: boolean;
  do(verb: WebApiActionsVerb, data: WebApi): void;
}