export interface SiteLanguage {
  code: string;
  culture: string;
  isEnabled: boolean;
  nameId: string;
}

export interface SiteLanguagePermissions extends SiteLanguage {
  isAllowed: boolean;
  permissions: { Count: number; };
}
