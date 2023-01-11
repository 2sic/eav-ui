// tslint:disable-next-line:max-line-length
import { FeatureSummary } from '../../features/models/feature-summary.model';
import { DialogContextApiKeys, DialogContextApp, DialogContextEnable, DialogContextLanguage, DialogContextPage, DialogContextSite, DialogContextSystem, DialogContextUser } from './dialog-context.models';

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
  Features?: FeatureSummary[];
}
