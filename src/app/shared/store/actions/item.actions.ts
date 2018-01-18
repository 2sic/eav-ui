import { Action } from '@ngrx/store';

import { Item } from '../../models/eav/item';

export const LOAD_ITEMS = 'LOAD_ITEMS';
export const LOAD_ITEMS_SUCCESS = 'LOAD_ITEMS_SUCCESS';

export class LoadItemsAction implements Action {
    readonly type = LOAD_ITEMS;

    constructor() { }
}

export class LoadItemsSuccessAction implements Action {
    readonly type = LOAD_ITEMS_SUCCESS;

    constructor(public payload: Item) { }
}

export type Actions
    = LoadItemsAction
    | LoadItemsSuccessAction;
