import { ActionReducer, ActionReducerMap, MetaReducer, } from '@ngrx/store';
import { angularConsoleLog } from '../../../../ng-dialogs/src/app/shared/helpers/angular-console-log.helper';
import { environment } from '../../../../ng-dialogs/src/environments/environment';
import * as fromGlobalConfiguration from './global-configuration.reducer';

export interface EavState {
  globalConfiguration: fromGlobalConfiguration.GlobalConfigurationState;
}

/** Console log all actions */
export function logger(reducer: ActionReducer<EavState>): ActionReducer<EavState> {
  return (state: EavState, action: any): EavState => {
    angularConsoleLog('[STORE] state', state);
    angularConsoleLog('[STORE] action', action);
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
