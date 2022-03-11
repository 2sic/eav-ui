import { Language } from '../../../../../edit/shared/models';
import { PermissionsCount } from '../../app-administration/models/permissions-count.model';

export interface DialogContextApp {
  /** Root for app APIs and content/query */
  Api: string;
  Folder: string;
  GettingStartedUrl: string;
  Id: number;
  Identifier: string;
  IsGlobal: boolean;
  IsInherited: boolean;
  Name: string;
  Permissions: PermissionsCount;
  SettingsScope: AppScope;
  Url: string;
}

export const AppScopes = {
  App: 'App',
  Site: 'Site',
  Global: 'Global',
} as const;
export type AppScope = typeof AppScopes[keyof typeof AppScopes];

export interface DialogContextEnable {
  /** Determines if app admin should show app-permissions (true for Apps, false for Content and Global) */
  AppPermissions?: boolean;
  /** Determines if Code editing should be enabled (true for super-users) */
  CodeEditor?: boolean;
  /** Determines if Queries should be enabled (true for Apps) */
  Query?: boolean;
  /** True if saving of formulas should be enabled (for edit-ui) */
  FormulaSave?: boolean;
}

export interface DialogContextLanguage {
  Current: string;
  List: Language[];
  Primary: string;
}

export interface DialogContextPage {
  Id: number;
}

export interface DialogContextSite {
  DefaultApp: DialogContextSiteApp;
  Id: number;
  PrimaryApp: DialogContextSiteApp;
  Url: string;
}

export interface DialogContextSystem {
  DefaultApp: DialogContextSiteApp;
  PrimaryApp: DialogContextSiteApp;
  Url: string;
}

export interface DialogContextSiteApp {
  ZoneId: number;
  AppId: number;
}
