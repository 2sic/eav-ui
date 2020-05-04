import { Action, createReducer, on } from '@ngrx/store';

import { keyDebug } from '../../../../ng-dialogs/src/app/shared/constants/sessions-keys';
import * as GlobalConfigurationActions from '../actions/global-configuration.actions';

export interface GlobalConfigurationState {
  debugEnabled: boolean;
}

export const initialState: GlobalConfigurationState = {
  debugEnabled: sessionStorage.getItem(keyDebug) === 'true',
};

const globalConfigurationReducer = createReducer(
  initialState,
  on(GlobalConfigurationActions.loadDebugEnabled, (state, { debugEnabled }) => ({ ...state, debugEnabled })),
  on(GlobalConfigurationActions.toggleDebugEnabled, (state) => ({ ...state, debugEnabled: !state.debugEnabled })),
);

export function reducer(state: GlobalConfigurationState | undefined, action: Action) {
  return globalConfigurationReducer(state, action);
}
