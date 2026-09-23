export interface SiteLanguage {
  code: string;
  culture: string;
  isEnabled: boolean;
}

export interface SiteLanguagePermissions extends SiteLanguage {
  isAllowed: boolean;
  permissionCount: number;
  // permissions: { Count: number; };
}
