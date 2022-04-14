import { Permission } from '../models/permission.model';

export interface PermissionsActionsParams {
  onDelete(permission: Permission): void;
}
