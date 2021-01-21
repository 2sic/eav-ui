import { Action, createReducer, on } from '@ngrx/store';
import { keyDebug } from '../../../../ng-dialogs/src/app/shared/constants/session.constants';
import * as GlobalConfigurationActions from '../actions/global-configuration.actions';

export interface GlobalConfigurationState {
  debugEnabled: boolean;
}

export const initialState: GlobalConfigurationState = {
  debugEnabled: sessionStorage.getItem(keyDebug) === 'true',
};

const globalConfigurationReducer = createReducer(
  initialState,
  on(GlobalConfigurationActions.loadDebugEnabled, (oldState, { debugEnabled }) => {
    const newState: GlobalConfigurationState = { ...oldState, debugEnabled };
    return newState;
  }),
  on(GlobalConfigurationActions.toggleDebugEnabled, (oldState) => {
    const newState: GlobalConfigurationState = { ...oldState, debugEnabled: !oldState.debugEnabled };
    return newState;
  }),
);

export function reducer(state: GlobalConfigurationState | undefined, action: Action) {
  return globalConfigurationReducer(state, action);
}
