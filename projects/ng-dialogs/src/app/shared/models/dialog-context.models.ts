import { JsInfo } from '@2sic.com/2sxc-typings';
import { PermissionsCount } from '../../app-administration/models/permissions-count.model';
import { EavWindow } from './eav-window.model';

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


declare const window: EavWindow;

// TODO: this is not the right place for this, but I (2dm) don't really know where this should go
// @SPM: You can move it to anywhere better

/**
 * This ensures that $2sxc is fully initialized with parameters which are provided later on
 * The appApi is being added in v12
 * It's important because in Oqtane the app-api root is different in from the normal admin-apis
 * @export
 * @param {DialogSettings} newSettings
 * @returns
 */
export function TempUpdateEnvVarsFromDialogSettings(appContext: DialogContextApp){
  try {
    const $2sxc = window.$2sxc;
    const previous = ($2sxc.env as any).header as JsInfo;
    const includedApiRoot = appContext?.Api;
    if(!includedApiRoot) return;
    window.$2sxc.env.load({ appApi: includedApiRoot, ...previous } as JsInfo );
  } catch { /* ignore */ }
}
