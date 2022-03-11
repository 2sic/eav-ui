import { Query } from '../../models/query.model';
import { IAgActions } from '../ag-actions';

// Test 2dm 2020-11-20 - I believe the current model has way too much ceremony
// I need to change ca. 10 places just to get one more action to work
// that's not great
export enum QueryActions {
  Edit,
  Metadata,
  Rest,
  Clone,
  Permissions,
  Export,
  Delete,
}

export interface QueriesActionsParams extends IAgActions<QueryActions, Query> {
  getEnablePermissions(): boolean;
}
