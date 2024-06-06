import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';
import { Component } from '@angular/core';
import { SiteLanguagePermissions } from '../../../../apps-management/models/site-language.model';
import { LanguagesPermissionsActionsParams } from './languages-permissions-actions.models';
import { MatBadgeModule } from '@angular/material/badge';
import { MatIconModule } from '@angular/material/icon';
import { SharedComponentsModule } from '../../../../shared/shared-components.module';
import { MatRippleModule } from '@angular/material/core';

@Component({
    selector: 'app-languages-permissions-actions',
    templateUrl: './languages-permissions-actions.component.html',
    styleUrls: ['./languages-permissions-actions.component.scss'],
    standalone: true,
    imports: [
        MatRippleModule,
        SharedComponentsModule,
        MatIconModule,
        MatBadgeModule,
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
