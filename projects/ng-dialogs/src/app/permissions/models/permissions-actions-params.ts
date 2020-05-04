import { ICellRendererParams } from '@ag-grid-community/core';

import { Permission } from './permission.model';

export interface PermissionsActionsParams extends ICellRendererParams {
  onDelete(permission: Permission): void;
}
