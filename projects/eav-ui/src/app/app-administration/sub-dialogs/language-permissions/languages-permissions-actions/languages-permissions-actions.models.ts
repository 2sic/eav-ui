import { SiteLanguagePermissions } from '../../../../apps-management/models/site-language.model';

export interface LanguagesPermissionsActionsParams {
  onOpenPermissions(language: SiteLanguagePermissions): void;
}
