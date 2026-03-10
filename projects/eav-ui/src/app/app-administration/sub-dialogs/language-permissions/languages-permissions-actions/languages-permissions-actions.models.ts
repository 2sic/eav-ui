import { SiteLanguagePermissions } from '../../../../apps-management/models/site-language.model';

export interface LanguagesPermissionsActionsParams {
  do(action: 'openPermissions', language: SiteLanguagePermissions): void;
}