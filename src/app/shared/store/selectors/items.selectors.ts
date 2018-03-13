import { createSelector } from '@ngrx/store';

import * as fromFeature from '../reducers';
import * as fromItems from '../reducers/item.reducer';

export const getItemState = createSelector(
    fromFeature.getEavState,
    (state: fromFeature.EavState) => state.itemState
);

export const getItems = createSelector(getItemState, fromItems.getItems);

