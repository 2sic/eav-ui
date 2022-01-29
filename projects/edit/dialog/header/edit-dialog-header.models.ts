import { FormReadOnly, PublishMode } from '../../shared/models';

export interface EditDialogHeaderTemplateVars {
  readOnly: boolean;
  readOnlyType: FormReadOnly['type'];
  hasLanguages: boolean;
  publishMode: PublishMode;
}
