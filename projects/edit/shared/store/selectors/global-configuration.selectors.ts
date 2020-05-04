import { createSelector } from '@ngrx/store';
import { GlobalConfigurationState } from '../reducers/global-configuration.reducer';
import { EavState } from '../reducers';

export const selectGlobalConfiguration = (state: EavState) => state.globalConfiguration;

export const selectDebugEnabled = createSelector(
  selectGlobalConfiguration,
  (state: GlobalConfigurationState) => state.debugEnabled
);
