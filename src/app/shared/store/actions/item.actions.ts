import { Action } from '@ngrx/store';

import { Item } from '../../models/eav/item';
import { EavAttributes } from '../../models/eav';

export const LOAD_ITEM = '[Item] LOAD_ITEM';
export const LOAD_ITEM_SUCCESS = '[Item] LOAD_ITEM_SUCCESS';
export const UPDATE_ITEM = '[Item] UPDATE_ITEM';
export const UPDATE_ITEM_SUCCESS = '[Item] UPDATE_ITEM_SUCCESS';
export const DELETE_ITEM = '[Item] DELETE_ITEM';

/**
 * Load
 */
export class LoadItemAction implements Action {
    readonly type = LOAD_ITEM;
    constructor(public path: string) { }
}
export class LoadItemSuccessAction implements Action {
    readonly type = LOAD_ITEM_SUCCESS;
    constructor(public newItem: Item) { }
}

/**
 * Update
 */
export class UpdateItemAction implements Action {
    readonly type = UPDATE_ITEM;
    constructor(public item: Item) { }
}
export class UpdateItemSuccessAction implements Action {
    readonly type = UPDATE_ITEM_SUCCESS;
    constructor(public item: Item) { }
}

/**
 * Delete
 */
export class DeleteItemAction implements Action {
    readonly type = DELETE_ITEM;
    constructor(public item: Item) { }
}

export type Actions
    = LoadItemAction
    | LoadItemSuccessAction
    | UpdateItemAction
    | UpdateItemSuccessAction
    | DeleteItemAction;
