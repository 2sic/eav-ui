import { Component } from '@angular/core';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { AgGridActionsBaseComponent } from '../../shared/ag-grid/ag-grid-actions-base';
import { TippyDirective } from '../../shared/directives/tippy.directive';
import { Permission } from '../models/permission.model';
import { PermissionsActionsParams, PermissionsActionsVerb } from './permissions-actions.models';

@Component({
  selector: 'app-permissions-actions',
  templateUrl: './permissions-actions.html',
  imports: [
    MatRippleModule,
    MatIconModule,
    TippyDirective,
  ]
})
export class PermissionsActionsComponent
  extends AgGridActionsBaseComponent<Permission, PermissionsActionsVerb, PermissionsActionsParams> {
}