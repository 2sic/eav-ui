import { PublishMode } from '../../../shared/models/eav/publish-mode.models';

export interface SaveStatusDialogData {
  formId: number;
}

export interface SaveStatusDialogTemplateVars {
  publishMode: PublishMode;
}
