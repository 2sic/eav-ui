import { App } from '../../models/app.model';
import { LightSpeedActionsParams } from '../../../admin-shared/lightspeed-action/lightspeed-actions.models';

export interface AppsListActionsParams extends LightSpeedActionsParams {
  onDelete(app: App): void;
  onFlush(app: App): void;
}
