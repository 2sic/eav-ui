import { Query } from '../../app-administration/models/query.model';
import { Permission } from '../../permissions/models/permission.model';

export interface DevRestQueryTemplateVars {
  query: Query;
  permissions: Permission[];
}
