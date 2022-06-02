import { FormReadOnly, PublishMode } from '../../shared/models';

export interface EditDialogHeaderTemplateVars {
  readOnly: boolean;
  readOnlyReason: FormReadOnly['reason'];
  hasLanguages: boolean;
  publishMode: PublishMode;
}
