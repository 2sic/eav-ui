import { createSelector } from '@ngrx/store';

import * as fromReducer from '../reducers';
import * as fromFeature from '../reducers/feature.reducer';

export const getFeatureState = createSelector(
    fromReducer.getEavState,
    (state: fromReducer.EavState) => state.features
);

export const getFeatures = createSelector(getFeatureState, fromFeature.getFeatures);
