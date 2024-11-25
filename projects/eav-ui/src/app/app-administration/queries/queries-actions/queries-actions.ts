import { Query } from '../../models/query.model';

// Test @2dm 2020-11-20 - I believe the current model has way too much ceremony
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

interface IAgActions<TAction, TData> {
  do(action: TAction, query: TData): void;
}

export interface QueriesActionsParams extends IAgActions<QueryActions, Query> {
  getEnablePermissions(): boolean;
}
