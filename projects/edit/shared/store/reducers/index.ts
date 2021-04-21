import { Action, ActionReducer, ActionReducerMap, MetaReducer, } from '@ngrx/store';
import { consoleLogAngular } from '../../../../ng-dialogs/src/app/shared/helpers/console-log-angular.helper';
import { environment } from '../../../../ng-dialogs/src/environments/environment';

// tslint:disable-next-line:no-empty-interface
export interface EavState {
}

/** Console log all actions */
export function logger(reducer: ActionReducer<EavState>): ActionReducer<EavState> {
  return (state: EavState, action: Action): EavState => {
    consoleLogAngular('[STORE] state:', state, 'action:', action);
    return reducer(state, action);
  };
}

/**
 * By default, @ngrx/store uses combineReducers with the reducer map to compose
 * the root meta-reducer. To add more meta-reducers, provide an array of meta-reducers
 * that will be composed to form the root meta-reducer.
 */
export const metaReducers: MetaReducer[] = !environment.production
  ? [logger]
  : [];

export const reducers: ActionReducerMap<EavState> = {
};
