import { ICellRendererParams } from '@ag-grid-community/core';
import { SiteLanguagePermissions } from '../../../../apps-management/models/site-language.model';

export interface LanguagesPermissionsActionsParams extends ICellRendererParams {
  onOpenPermissions(language: SiteLanguagePermissions): void;
}
