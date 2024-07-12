import { App } from '../../models/app.model';
import { LightSpeedActionsParams } from '../../../admin-shared/lightspeed-action/lightspeed-actions.models';

export type AppsListActionsType = 'deleteApp' | 'flushCache';

export interface AppsListActionsParams extends LightSpeedActionsParams {
  do(verb: AppsListActionsType, app: App): void;
}
