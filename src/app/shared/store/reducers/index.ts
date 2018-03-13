import { ActionReducerMap, createFeatureSelector } from '@ngrx/store';

import * as fromItems from './item.reducer';
import * as fromContentType from './content-type.reducer';

export interface EavState {
    itemState: fromItems.ItemState;
    contentTypeState: fromContentType.ContentTypeState;
}

export const reducers: ActionReducerMap<EavState> = {
    itemState: fromItems.itemReducer,
    contentTypeState: fromContentType.contentTypeReducer,
};

export const getEavState = createFeatureSelector<EavState>('eavItemDialog');
