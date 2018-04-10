import { Action } from '@ngrx/store';

import { Item } from '../../models/eav/item';
import { EavAttributes } from '../../models/eav';
import { EavValues } from '../../models/eav/eav-values';

export const LOAD_ITEM = '[Item] LOAD_ITEM';
export const LOAD_ITEM_SUCCESS = '[Item] LOAD_ITEM_SUCCESS';
export const UPDATE_ITEM = '[Item] UPDATE_ITEM';
export const UPDATE_ITEM_SUCCESS = '[Item] UPDATE_ITEM_SUCCESS';
export const UPDATE_ITEM_ATTRIBUTE = '[Item] UPDATE_ITEM_ATTRIBUTE';
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
    constructor(public attributes: EavAttributes, public id: number) { }
}
export class UpdateItemSuccessAction implements Action {
    readonly type = UPDATE_ITEM_SUCCESS;
    constructor(public item: Item) { }
}

export class UpdateItemAttributeAction implements Action {
    readonly type = UPDATE_ITEM_ATTRIBUTE;
    constructor(public id: number, public attribute: EavValues<any>, public attributeKey, ) { }
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
    | UpdateItemAttributeAction
    | DeleteItemAction;
