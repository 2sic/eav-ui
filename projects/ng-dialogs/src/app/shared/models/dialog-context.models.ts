import { PermissionsCount } from '../../app-administration/models/permissions-count.model';

export interface DialogContextApp {
  GettingStartedUrl: string;
  Id: number;
  Identifier: unknown;
  Name: string;
  Folder: string;
  Permissions: PermissionsCount;
  Url: string;
  /** New in v12 - the root for app APIs and content/query */
  Api: string;
}

export interface DialogContextEnable {
  AppPermissions: boolean;
  CodeEditor: boolean;
  Query: boolean;
}

export interface DialogContextLanguage {
  All: DialogContextAllLangs;
  Current: string;
  Primary: string;
}

export interface DialogContextAllLangs {
  [key: string]: string;
}

export interface DialogContextPage {
  Id: number;
}

export interface DialogContextSite {
  Id: number;
  Url: string;
}

export interface DialogContextSystem {
  Url: string;
}
