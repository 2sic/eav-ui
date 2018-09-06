import { ActionReducerMap, createFeatureSelector, ActionReducer, MetaReducer, } from '@ngrx/store';
import { storeFreeze } from 'ngrx-store-freeze';

import { environment } from '../../../../environments/environment';
import * as fromItems from './item.reducer';
import * as fromInputTypes from './input-type.reducer';
import * as fromContentType from './content-type.reducer';
import * as fromLanguages from './language.reducer';
import * as fromFeatures from './feature.reducer';

export interface EavState {
    itemState: fromItems.ItemState;
    inputTypeState: fromInputTypes.InputTypeState;
    contentTypeState: fromContentType.ContentTypeState;
    languages: fromLanguages.LanguagesState;
    features: fromFeatures.FeaturesState;
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
    ? [logger, storeFreeze]
    : [];

export const reducers: ActionReducerMap<EavState> = {
    itemState: fromItems.itemReducer,
    inputTypeState: fromInputTypes.inputTypeReducer,
    contentTypeState: fromContentType.contentTypeReducer,
    languages: fromLanguages.languageReducer,
    features: fromFeatures.featureReducer,
};

export const getEavState = createFeatureSelector<EavState>('eavItemDialog');

