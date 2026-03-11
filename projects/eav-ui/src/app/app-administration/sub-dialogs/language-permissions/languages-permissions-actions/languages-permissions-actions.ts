import { Component } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { AgGridActionsBaseComponent } from 'projects/eav-ui/src/app/shared/ag-grid/ag-grid-actions-base';
import { TippyDirective } from 'projects/eav-ui/src/app/shared/directives/tippy.directive';
import { SiteLanguagePermissions } from '../../../../apps-management/models/site-language.model';
import { LanguagesPermissionsActionsParams } from './languages-permissions-actions.models';

@Component({
  selector: 'app-languages-permissions-actions',
  templateUrl: './languages-permissions-actions.html',
  imports: [
    MatRippleModule,
    MatIconModule,
    MatBadgeModule,
    TippyDirective,
  ]
})
export class LanguagesPermissionsActionsComponent
  extends AgGridActionsBaseComponent<SiteLanguagePermissions, 'openPermissions', LanguagesPermissionsActionsParams> {

  get permissionCount() { return this.data?.Permissions?.Count; }
}