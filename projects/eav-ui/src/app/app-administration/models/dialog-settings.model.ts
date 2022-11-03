// tslint:disable-next-line:max-line-length
import { DialogContextApp, DialogContextEnable, DialogContextFeature, DialogContextLanguage, DialogContextPage, DialogContextSite, DialogContextSystem, DialogContextUser } from '../../shared/models/dialog-context.models';

export interface DialogSettings {
  Context: DialogContext;
}

export interface DialogContext {
  App: DialogContextApp;
  Enable: DialogContextEnable;
  Language: DialogContextLanguage;
  Page?: DialogContextPage;
  Site: DialogContextSite;
  System: DialogContextSystem;
  User?: DialogContextUser;
  Features?: DialogContextFeature[];
}
