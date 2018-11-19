import * as fromFeatures from '../actions/feature.actions';
import { Feature } from '../../models/feature/feature';


export interface FeaturesState {
    features: Feature[];
}

export const initialState: FeaturesState = {
    features: [],
};

export function featureReducer(state = initialState, action: fromFeatures.Actions): FeaturesState {
    switch (action.type) {
        case fromFeatures.LOAD_FEATURES: {
            return {
                ...state,
                ...{
                    features: [...action.newFeatures],
                }
            };
        }
        default: {
            return state;
        }
    }
}

export const getFeatures = (state: FeaturesState) => state.features;
