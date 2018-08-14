import { createSelector } from '@ngrx/store';

import * as fromFeature from '../reducers';
import * as fromInputType from '../reducers/input-type.reducer';

export const getInputTypeState = createSelector(
    fromFeature.getEavState,
    (state: fromFeature.EavState) => state.inputTypeState
);

export const getInputTypes = createSelector(getInputTypeState, fromInputType.getInputTypes);
