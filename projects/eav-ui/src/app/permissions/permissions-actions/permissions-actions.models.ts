import { Permission } from '../models/permission.model';

export type PermissionsActionsVerb = 'delete';

export interface PermissionsActionsParams {
  do(verb: PermissionsActionsVerb, permission: Permission): void;
}