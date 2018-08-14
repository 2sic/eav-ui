import { Action } from '@ngrx/store';

import { InputType } from '../../models/eav';

// export const LOAD_INPUT_TYPE = 'LOAD_INPUT_TYPE';
export const LOAD_INPUT_TYPE_SUCCESS = 'LOAD_INPUT_TYPE_SUCCESS';


export class LoadInputTypeSuccessAction implements Action {
    readonly type = LOAD_INPUT_TYPE_SUCCESS;

    constructor(public newInputTypes: InputType[]) {
    }
}

export type Actions
    = LoadInputTypeSuccessAction;
