import { LightSpeedActionsParams } from '../../../admin-shared/lightspeed-action/lightspeed-actions.models';
import { View } from '../../models/view.model';

export type ViewActionsType = 'openCode' | 'openPermissions' | 'exportView' | 'deleteView' | 'cloneView' | 'openMetadata';

export interface ViewActionsParams extends LightSpeedActionsParams {
  enableCodeGetter(): boolean;
  enablePermissionsGetter(): boolean;

  do(verb: ViewActionsType, view: View): void;
  urlTo(verb: ViewActionsType, view: View): string;
}
