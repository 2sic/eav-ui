import { createAction, props } from '@ngrx/store';
import { GlobalConfigurationState } from '../reducers/global-configuration.reducer';

export const loadDebugEnabled = createAction(
  '[GlobalConfiguration] LOAD_DEBUG_ENABLED',
  props<GlobalConfigurationState>()
);

export const toggleDebugEnabled = createAction('[GlobalConfiguration] TOGGLE_DEBUG_ENABLED');
