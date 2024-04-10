import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';
import { Component } from '@angular/core';
import { Permission } from '../models/permission.model';
import { PermissionsActionsParams } from './permissions-actions.models';
import { MatIconModule } from '@angular/material/icon';
import { SharedComponentsModule } from '../../shared/shared-components.module';
import { MatRippleModule } from '@angular/material/core';

@Component({
    selector: 'app-permissions-actions',
    templateUrl: './permissions-actions.component.html',
    styleUrls: ['./permissions-actions.component.scss'],
    standalone: true,
    imports: [
        MatRippleModule,
        SharedComponentsModule,
        MatIconModule,
    ],
})
export class PermissionsActionsComponent implements ICellRendererAngularComp {
  private params: ICellRendererParams & PermissionsActionsParams;

  agInit(params: ICellRendererParams & PermissionsActionsParams): void {
    this.params = params;
  }

  refresh(params?: any): boolean {
    return true;
  }

  deletePermission(): void {
    const permission: Permission = this.params.data;
    this.params.onDelete(permission);
  }
}
