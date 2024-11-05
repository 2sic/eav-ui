import { LightSpeedActionsParams } from '../../../admin-shared/lightspeed-action/lightspeed-actions.models';
import { App } from '../../models/app.model';

export type AppsListActionsType = 'deleteApp' | 'flushCache';

export interface AppsListActionsParams extends LightSpeedActionsParams {
  do(verb: AppsListActionsType, app: App): void;
}
