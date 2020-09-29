import { DialogContextAllLangs } from '../../../ng-dialogs/src/app/shared/models/dialog-context.models';
import { VersioningOptions } from './eav/versioning-options';

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
}
