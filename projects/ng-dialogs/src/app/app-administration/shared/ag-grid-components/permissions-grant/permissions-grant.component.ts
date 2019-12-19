import { Component } from '@angular/core';
import { ICellRendererAngularComp } from '@ag-grid-community/angular';

import { Permission } from '../../models/permission.model';
import { PermissionsGrantParams } from '../../models/permissions-grant-params';

@Component({
  selector: 'app-permissions-grant',
  templateUrl: './permissions-grant.component.html',
  styleUrls: ['./permissions-grant.component.scss']
})
export class PermissionsGrantComponent implements ICellRendererAngularComp {
  params: PermissionsGrantParams;
  permission: Permission;

  agInit(params: PermissionsGrantParams) {
    this.params = params;
    this.permission = params.data;
  }

  refresh(params?: any): boolean {
    return true;
  }

  deletePermission(event: MouseEvent) {
    event.stopPropagation();
    this.params.onDelete(this.permission);
  }
}
