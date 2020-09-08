import { VersioningOptions } from './eav/versioning-options';

export interface EavConfig {
  zoneId: string;
  appId: string;
  approot: string;
  cbid: string;
  debug: string;
  dialog: string;
  items: string;
  lang: string;
  langpri: string;
  langs: string;
  mid: string;
  mode: string;
  partOfPage: string;
  portalroot: string;
  publishing: string;
  tid: string;
  rvt: string;
  websiteroot: string;
  systemroot: string;
  versioningOptions: VersioningOptions;
}
