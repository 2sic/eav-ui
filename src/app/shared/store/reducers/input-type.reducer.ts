import { InputType } from '../../models/eav';
import * as fromInputType from '../actions/input-type.actions';

export interface InputTypeState {
    inputTypes: InputType[];
}

export const initialState: InputTypeState = {
    inputTypes: []
};

export function inputTypeReducer(state = initialState, action: fromInputType.Actions): InputTypeState {
    switch (action.type) {
        case fromInputType.LOAD_INPUT_TYPE_SUCCESS: {
            return {
                ...state,
                ...{
                    inputTypes: [...action.newInputTypes]
                }
            };
        }
        default: {
            return state;
        }
    }
}

export const getInputTypes = (state: InputTypeState) => state.inputTypes;

