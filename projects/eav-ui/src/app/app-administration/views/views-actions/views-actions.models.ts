import { LightSpeedActionsParams } from '../../../admin-shared/lightspeed-action/lightspeed-actions.models';
import { View } from '../../models/view.model';

export interface ViewActionsParams extends LightSpeedActionsParams {
  enableCodeGetter(): boolean;
  enablePermissionsGetter(): boolean;
  onOpenCode(view: View): void;
  onOpenPermissions(view: View): void;
  onOpenMetadata(view: View): void;
  onClone(view: View): void;
  onExport(view: View): void;
  onDelete(view: View): void;
}
