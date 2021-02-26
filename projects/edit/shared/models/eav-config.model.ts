import { VersioningOptions } from '.';
import { DialogContextAllLangs } from '../../../ng-dialogs/src/app/shared/models/dialog-context.models';

/** WARNING! These are constants that form was loaded with. They do not change while form is running */
export interface EavConfig {
  zoneId: string;
  appId: string;
  appRoot: string;
  lang: string;
  langPri: string;
  langs: DialogContextAllLangs;
  moduleId: string;
  partOfPage: string;
  portalRoot: string;
  tabId: string;
  systemRoot: string;
  versioningOptions: VersioningOptions;
  formId: number;
  isParentDialog: boolean;
  itemGuids: string[];
  createMode: boolean;
  isCopy: boolean;
  enableHistory: boolean;
}
