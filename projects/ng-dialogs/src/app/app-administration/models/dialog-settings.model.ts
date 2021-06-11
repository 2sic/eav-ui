import { EditDialogContext } from 'projects/edit/dialog/main/edit-dialog-main.models';
import { DialogContextEnable, DialogContextPage } from '../../shared/models/dialog-context.models';

export interface DialogSettings {
  Context: DialogContext;
}

export interface DialogContext extends EditDialogContext {
  Enable: DialogContextEnable;
  Page: DialogContextPage;
}
