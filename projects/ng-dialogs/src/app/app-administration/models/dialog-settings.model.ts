import { EditDialogContext } from 'projects/edit/eav-item-dialog/multi-item-edit-form/multi-item-edit-form.models';
import { DialogContextEnable, DialogContextPage } from '../../shared/models/dialog-context.models';

export interface DialogSettings {
  Context: DialogContext;
}

export interface DialogContext extends EditDialogContext {
  // App: DialogContextApp;
  Enable: DialogContextEnable;
  // Language: DialogContextLanguage;
  Page: DialogContextPage;
  // Site: DialogContextSite;
  // System: DialogContextSystem;
}
