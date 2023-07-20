import { PublishMode, VersioningOptions } from '../../../shared/models';

export interface PublishStatusDialogViewModel {
  publishMode: PublishMode;
  options: VersioningOptions;
}
