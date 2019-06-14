import { createSelector } from '@ngrx/store';

import * as fromReducers from '../reducers';
import * as fromGlobalConfiguration from '../reducers/global-configuration.reducer';

export const getGlobalConfigurationState = createSelector(
    fromReducers.getEavState,
    (state: fromReducers.EavState) => state.globalConfiguration
);

export const getDebugEnabled = createSelector(getGlobalConfigurationState, fromGlobalConfiguration.getDebugEnabled);
