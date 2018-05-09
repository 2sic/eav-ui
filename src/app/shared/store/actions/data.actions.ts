import { Action } from '@ngrx/store';

export const LOAD_ALL_DATA = '[Item] LOAD_ALL_DATA';

/**
 * Load
 */
export class LoadAllDataAction implements Action {
    readonly type = LOAD_ALL_DATA;
    constructor() {
        console.log('call action LOAD_ALL_DATA');
    }
}

export type Actions
    = LoadAllDataAction;
