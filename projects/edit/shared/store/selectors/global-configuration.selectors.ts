import { createSelector } from '@ngrx/store';
import { EavState } from '../reducers';
import { GlobalConfigurationState } from '../reducers/global-configuration.reducer';

export const selectGlobalConfiguration = (state: EavState) => state.globalConfiguration;

export const selectDebugEnabled = createSelector(
  selectGlobalConfiguration,
  (state: GlobalConfigurationState) => state.debugEnabled
);
