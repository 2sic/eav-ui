export interface SiteLanguage {
  Code: string;
  Culture: string;
  IsEnabled: boolean;
  NameId: string;
}

export interface SiteLanguagePermissions extends SiteLanguage {
  IsAllowed: boolean;
  Permissions: { Count: number; };
}
