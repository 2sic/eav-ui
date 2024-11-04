import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';
import { JsonPipe } from '@angular/common';
import { Component } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { TippyDirective } from 'projects/eav-ui/src/app/shared/directives/tippy.directive';
import { SiteLanguagePermissions } from '../../../../apps-management/models/site-language.model';
import { LanguagesPermissionsActionsParams } from './languages-permissions-actions.models';

@Component({
  selector: 'app-languages-permissions-actions',
  templateUrl: './languages-permissions-actions.component.html',
  standalone: true,
  imports: [
    MatRippleModule,
    MatIconModule,
    MatBadgeModule,
    TippyDirective,
    JsonPipe
  ],
})
export class LanguagesPermissionsActionsComponent implements ICellRendererAngularComp {
  language: SiteLanguagePermissions;

  private params: ICellRendererParams & LanguagesPermissionsActionsParams;

  agInit(params: ICellRendererParams & LanguagesPermissionsActionsParams): void {
    this.params = params;
    this.language = this.params.data;
  }

  refresh(params?: any): boolean {
    return true;
  }

  openPermissions(): void {
    this.params.onOpenPermissions(this.language);
  }
}
