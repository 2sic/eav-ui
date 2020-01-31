import * as fromGlobalConfiguration from '../actions/global-configuration.actions';

export interface GlobalConfigurationState {
    debugEnabled: boolean;
}

export const initialState: GlobalConfigurationState = {
    debugEnabled: false,
};

export function globalConfigurationReducer(state = initialState, action: fromGlobalConfiguration.Actions): GlobalConfigurationState {
    switch (action.type) {
        case fromGlobalConfiguration.LOAD_DEBUG_ENABLED: {
            return {
                ...state,
                ...{
                    debugEnabled: action.debugEnabled,
                }
            };
        }
        default: {
            return state;
        }
    }
}

export const getDebugEnabled = (state: GlobalConfigurationState) => state.debugEnabled;
