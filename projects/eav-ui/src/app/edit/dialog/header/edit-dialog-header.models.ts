import { FormReadOnly, PublishMode } from '../../shared/models';

export interface EditDialogHeaderViewModel {
  readOnly: boolean;
  readOnlyReason: FormReadOnly['reason'];
  hasLanguages: boolean;
  publishMode: PublishMode;
}
