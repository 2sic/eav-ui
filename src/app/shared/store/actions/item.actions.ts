import { Action } from '@ngrx/store';

import { Item } from '../../models/eav/item';
import { EavAttributes, EavValue } from '../../models/eav';
import { EavValues } from '../../models/eav/eav-values';
import { EavDimensions } from '../../models/eav/eav-dimensions';

export const LOAD_ITEM = '[Item] LOAD_ITEM';
export const LOAD_ITEM_SUCCESS = '[Item] LOAD_ITEM_SUCCESS';
export const UPDATE_ITEM = '[Item] UPDATE_ITEM';
export const UPDATE_ITEM_SUCCESS = '[Item] UPDATE_ITEM_SUCCESS';

export const ADD_ITEM_ATTRIBUTE = '[Item] ADD_ITEM_ATTRIBUTE';
export const UPDATE_ITEM_ATTRIBUTE = '[Item] UPDATE_ITEM_ATTRIBUTE';

export const ADD_ITEM_ATTRIBUTE_VALUE = '[Item] ADD_ITEM_ATTRIBUTE_VALUE';
export const UPDATE_ITEM_ATTRIBUTE_VALUE = '[Item] UPDATE_ITEM_ATTRIBUTE_VALUE';

export const ADD_ITEM_ATTRIBUTE_DIMENSION = '[Item] ADD_ITEM_ATTRIBUTE_DIMENSION';
export const UPDATE_ITEM_ATTRIBUTE_DIMENSION = '[Item] UPDATE_ITEM_ATTRIBUTE_DIMENSION';
export const REMOVE_ITEM_ATTRIBUTE_DIMENSION = '[Item] REMOVE_ITEM_ATTRIBUTE_DIMENSION';

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
 * Add
 */

export class AddItemAttributeAction implements Action {
    readonly type = ADD_ITEM_ATTRIBUTE;
    constructor(public id: number, public attribute: EavValues<any>, public attributeKey) { }
}

export class AddItemAttributeValueAction implements Action {
    readonly type = ADD_ITEM_ATTRIBUTE_VALUE;
    constructor(public id: number, public attributeValue: EavValue<any>, public attributeKey) { }
}

export class AddItemAttributeDimensionAction implements Action {
    readonly type = ADD_ITEM_ATTRIBUTE_DIMENSION;
    constructor(public id: number, public attributeValue: EavValue<any>, public attributeKey) { }
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
    constructor(public id: number, public attribute: EavValues<any>, public attributeKey: string) { }
}

export class UpdateItemAttributeValueAction implements Action {
    readonly type = UPDATE_ITEM_ATTRIBUTE_VALUE;
    constructor(public id: number, public attributeKey: string, public attributeValue: string,
        public existingLanguageKey: string, public isReadOnly: boolean) { }
}

export class UpdateItemAttributeDimensionAction implements Action {
    readonly type = UPDATE_ITEM_ATTRIBUTE_DIMENSION;
    constructor(public id: number, public attributeKey: string, public dimensionValue: string,
        public existingDimensionValue: string, public isReadOnly: boolean) { }
}

export class RemoveItemAttributeDimensionAction implements Action {
    readonly type = REMOVE_ITEM_ATTRIBUTE_DIMENSION;
    constructor(public id: number, public attributeKey: string, public dimensionValue: string) { }
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
    | AddItemAttributeAction
    | AddItemAttributeValueAction
    | AddItemAttributeDimensionAction
    | UpdateItemAction
    | UpdateItemAttributeAction
    | UpdateItemAttributeValueAction
    | UpdateItemAttributeDimensionAction
    | UpdateItemSuccessAction
    | UpdateItemAttributeAction
    | RemoveItemAttributeDimensionAction
    | DeleteItemAction;
