import { ActionReducerMap, createFeatureSelector, ActionReducer, MetaReducer, } from '@ngrx/store';

import { environment } from '../../../../environments/environment';
import * as fromGlobalConfiguration from './global-configuration.reducer';

export interface EavState {
    globalConfiguration: fromGlobalConfiguration.GlobalConfigurationState;
}

// console.log all actions
export function logger(reducer: ActionReducer<EavState>): ActionReducer<EavState> {
    return function (state: EavState, action: any): EavState {
        // console.log('[STORE] state', JSON.stringify(state));
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
    globalConfiguration: fromGlobalConfiguration.globalConfigurationReducer,
};

export const getEavState = createFeatureSelector<EavState>('eavItemDialog');
