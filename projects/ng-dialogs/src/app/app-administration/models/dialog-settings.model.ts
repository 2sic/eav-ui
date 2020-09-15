import { DialogContextApp, DialogContextEnable, DialogContextLanguage, DialogContextPage, DialogContextSite, DialogContextSystem } from '../../shared/models/dialog-context.models';

export interface DialogSettings {
  Context: DialogContext;
}

export interface DialogContext {
  App: DialogContextApp;
  Enable: DialogContextEnable;
  Language: DialogContextLanguage;
  Page: DialogContextPage;
  Site: DialogContextSite;
  System: DialogContextSystem;
}
