import { Action } from '@ngrx/store';

import { Item } from '../../models/eav/item';

export const LOAD_ITEMS = '[Items] LOAD_ITEMS';
export const LOAD_ITEMS_SUCCESS = '[Items] LOAD_ITEMS_SUCCESS';
export const UPDATE_ITEM = '[Item] UPDATE_ITEM';
export const UPDATE_ITEM_SUCCESS = '[Item] UPDATE_ITEM_SUCCESS';

/**
 * Load
 */
export class LoadItemsAction implements Action {
    readonly type = LOAD_ITEMS;
    constructor(public path: string) { }
}
export class LoadItemsSuccessAction implements Action {
    readonly type = LOAD_ITEMS_SUCCESS;
    constructor(public newItem: Item) { }
}

/**
 * Update
 */
export class UpdateItem implements Action {
    readonly type = UPDATE_ITEM;
    constructor(public item: Item) { }
}
export class UpdateItemSuccess implements Action {
    readonly type = UPDATE_ITEM_SUCCESS;
    constructor(public item: Item) { }
}

export type Actions
    = LoadItemsAction
    | LoadItemsSuccessAction
    | UpdateItem
    | UpdateItemSuccess;
