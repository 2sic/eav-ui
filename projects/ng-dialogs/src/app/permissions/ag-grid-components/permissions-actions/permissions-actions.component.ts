import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Permission } from '../../models/permission.model';
import { PermissionsActionsParams } from './permissions-actions.models';

@Component({
  selector: 'app-permissions-actions',
  templateUrl: './permissions-actions.component.html',
  styleUrls: ['./permissions-actions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PermissionsActionsComponent implements ICellRendererAngularComp {
  private params: PermissionsActionsParams;

  agInit(params: PermissionsActionsParams) {
    this.params = params;
  }

  refresh(params?: any): boolean {
    return true;
  }

  deletePermission() {
    const permission: Permission = this.params.data;
    this.params.onDelete(permission);
  }
}
