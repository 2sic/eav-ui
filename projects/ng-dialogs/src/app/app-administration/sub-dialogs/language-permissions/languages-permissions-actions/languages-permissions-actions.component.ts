import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { Component } from '@angular/core';
import { SiteLanguagePermissions } from '../../../../apps-management/models/site-language.model';
import { LanguagesPermissionsActionsParams } from './languages-permissions-actions.models';

@Component({
  selector: 'app-languages-permissions-actions',
  templateUrl: './languages-permissions-actions.component.html',
  styleUrls: ['./languages-permissions-actions.component.scss'],
})
export class LanguagesPermissionsActionsComponent implements ICellRendererAngularComp {
  language: SiteLanguagePermissions;

  private params: LanguagesPermissionsActionsParams;

  constructor() { }

  agInit(params: LanguagesPermissionsActionsParams) {
    this.params = params;
    this.language = this.params.data;
  }

  refresh(params?: any): boolean {
    return true;
  }

  openPermissions() {
    this.params.onOpenPermissions(this.language);
  }
}
