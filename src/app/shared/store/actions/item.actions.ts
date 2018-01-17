import { Action } from '@ngrx/store';

import { EavItem } from '../../models/eav/eav-item';

export const LOAD_EAV_ITEMS = 'LOAD_EAV_ITEMS';
export const LOAD_EAV_ITEMS_SUCCESS = 'LOAD_EAV_ITEMS_SUCCESS';

export class LoadEavItemsAction implements Action {
    readonly type = LOAD_EAV_ITEMS;

    constructor() { }
}

export class LoadEavItemsSuccessAction implements Action {
    readonly type = LOAD_EAV_ITEMS_SUCCESS;

    constructor(public payload: EavItem) { }
}

export type Actions
    = LoadEavItemsAction
    | LoadEavItemsSuccessAction;
