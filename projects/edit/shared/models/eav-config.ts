import { EditDialogAllLangs } from '../../eav-item-dialog/multi-item-edit-form/multi-item-edit-form.models';
import { VersioningOptions } from './eav/versioning-options';

export interface EavConfig {
  zoneId: string;
  appId: string;
  appRoot: string;
  lang: string;
  langPri: string;
  langs: EditDialogAllLangs;
  moduleId: string;
  partOfPage: string;
  portalRoot: string;
  tabId: string;
  systemRoot: string;
  versioningOptions: VersioningOptions;
}
