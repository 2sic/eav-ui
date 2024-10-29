import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';
import { Component } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { guidRegex } from '../../../shared/constants/guid.constants';
import { TippyDirective } from '../../../shared/directives/tippy.directive';
import { ContentType } from '../../models/content-type.model';
import { DataActionsParams, DataActionType } from './data-actions.models';

@Component({
  selector: 'app-data-actions',
  templateUrl: './data-actions.component.html',
  standalone: true,
  imports: [
    MatRippleModule,
    MatIconModule,
    MatBadgeModule,
    MatMenuModule,
    TippyDirective,
  ],
})
export class DataActionsComponent implements ICellRendererAngularComp {
  contentType: ContentType;
  enablePermissions: boolean;
  private params: ICellRendererParams & DataActionsParams;

  agInit(params: ICellRendererParams & DataActionsParams): void {
    this.params = params;
    this.contentType = this.params.data;
    const enablePermissions = this.params.enablePermissionsGetter();
    this.enablePermissions = enablePermissions && guidRegex().test(this.contentType.StaticName);
  }

  refresh(params?: any): boolean {
    return true;
  }

  do(verb: DataActionType): void {
    this.params.do(verb, this.contentType);
  }

}
