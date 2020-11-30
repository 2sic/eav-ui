import { PublishMode } from '../../../shared/models/eav/publish-mode.models';

export interface PublishStatusDialogData {
  formId: number;
}

export interface PublishStatusDialogTemplateVars {
  publishMode: PublishMode;
}
