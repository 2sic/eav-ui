import { ICellRendererParams } from '@ag-grid-community/core';

import { Permission } from './permission.model';

export interface PermissionsGrantParams extends ICellRendererParams {
  onDelete(permission: Permission): void;
}
