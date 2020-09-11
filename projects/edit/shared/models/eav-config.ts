import { EditDialogAllLangs } from '../../eav-item-dialog/multi-item-edit-form/multi-item-edit-form.models';
import { VersioningOptions } from './eav/versioning-options';

export interface EavConfig {
  zoneId: string;
  appId: string;
  approot: string;
  cbid: string;
  lang: string;
  langpri: string;
  langs: EditDialogAllLangs;
  mid: string;
  partOfPage: string;
  portalroot: string;
  tid: string;
  rvt: string;
  websiteroot: string;
  systemroot: string;
  versioningOptions: VersioningOptions;
}
