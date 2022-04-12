import { ICellRendererParams } from '@ag-grid-community/core';
import { Permission } from '../models/permission.model';

export interface PermissionsActionsParams extends ICellRendererParams {
  onDelete(permission: Permission): void;
}
