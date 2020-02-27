import { ActionReducerMap, ActionReducer, MetaReducer, } from '@ngrx/store';

import { environment } from '../../../../ng-dialogs/src/environments/environment';
import * as fromGlobalConfiguration from './global-configuration.reducer';

export interface EavState {
  globalConfiguration: fromGlobalConfiguration.GlobalConfigurationState;
}

/** Console log all actions */
export function logger(reducer: ActionReducer<EavState>): ActionReducer<EavState> {
  return function (state: EavState, action: any): EavState {
    console.log('[STORE] state', state);
    console.log('[STORE] action', action);
    return reducer(state, action);
  };
}

/**
 * By default, @ngrx/store uses combineReducers with the reducer map to compose
 * the root meta-reducer. To add more meta-reducers, provide an array of meta-reducers
 * that will be composed to form the root meta-reducer.
 */
export const metaReducers: MetaReducer<any>[] = !environment.production
  ? [logger]
  : [];

export const reducers: ActionReducerMap<EavState> = {
  globalConfiguration: fromGlobalConfiguration.reducer,
};
