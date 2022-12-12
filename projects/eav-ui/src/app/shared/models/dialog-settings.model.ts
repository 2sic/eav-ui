// tslint:disable-next-line:max-line-length
import { DialogContextApiKeys, DialogContextApp, DialogContextEnable, DialogContextFeature, DialogContextLanguage, DialogContextPage, DialogContextSite, DialogContextSystem, DialogContextUser } from './dialog-context.models';

export interface DialogSettings {
  Context: DialogContext;
}

export interface DialogContext {
  App: DialogContextApp;
  ApiKeys: DialogContextApiKeys[];
  Enable: DialogContextEnable;
  Language: DialogContextLanguage;
  Page?: DialogContextPage;
  Site: DialogContextSite;
  System: DialogContextSystem;
  User?: DialogContextUser;
  Features?: DialogContextFeature[];
}
