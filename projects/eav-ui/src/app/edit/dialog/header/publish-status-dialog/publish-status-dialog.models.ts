import { VersioningOptions } from '../../../state/form-configuration.model';
import { PublishMode } from '../../main/edit-dialog-main.models';

export interface PublishStatusDialogViewModel {
  publishMode: PublishMode;
  options: VersioningOptions;
}
