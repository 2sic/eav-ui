import { EditDialogContext } from 'projects/edit/eav-item-dialog/multi-item-edit-form/multi-item-edit-form.models';
import { DialogContextEnable, DialogContextPage } from '../../shared/models/dialog-context.models';

export interface DialogSettings {
  Context: DialogContext;
}

export interface DialogContext extends EditDialogContext {
  Enable: DialogContextEnable;
  Page: DialogContextPage;
}
