import { PermissionsCount } from '../../app-administration/models/permissions-count.model';
import { Language } from '../../edit/shared/models';

export interface DialogContextApp {
  /** Root for app APIs and content/query */
  Api: string;
  Folder: string;
  GettingStartedUrl: string;
  Id: number;
  Identifier: string;
  IsContentApp: boolean;
  IsGlobalApp: boolean;
  IsInherited: boolean;
  IsShared: boolean;
  IsSiteApp: boolean;
  Name: string;
  Permissions: PermissionsCount;
  SettingsScope: AppScope;
  Url: string;
  SharedUrl: string;
}

export interface DialogContextApiKeys {
  NameId: string;
  ApiKey: string;
  IsDemo: boolean;
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
  DebugMode: boolean;
  /** True if saving of formulas should be enabled (for edit-ui) */
  FormulaSave?: boolean;
  /** While debug is enabled, this allows some Edit Ui actions even when they are disabled in fields settings */
  OverrideEditRestrictions?: boolean;
  /** Determines if Queries should be enabled (true for Apps) */
  Query?: boolean;
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

export interface DialogContextUser {
  Email: string;
  Id: number;
  Guid: string;
  IsAnonymous: boolean;
  IsSiteAdmin: boolean;
  IsContentAdmin: boolean;
  IsSystemAdmin: boolean;
  Name: string;
  Username: string;
}

export interface DialogContextFeature {
  NameId: string;
  Enabled: boolean;
}
