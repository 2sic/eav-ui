import { Action } from '@ngrx/store';

import { Item } from '../../models/eav/item';

// Item Attributes
export const SAVE_ITEM_ATTRIBUTES_VALUES = '[Item] SAVE_ITEM_ATTRIBUTES_VALUES';
export const SAVE_ITEM_ATTRIBUTES_VALUES_SUCCESS = '[Item] SAVE_ITEM_ATTRIBUTES_VALUES_SUCCESS';
export const SAVE_ITEM_ATTRIBUTES_VALUES_ERROR = '[Item] SAVE_ITEM_ATTRIBUTES_VALUES_ERROR';

/** Save (submit) */
export class SaveItemAttributesValuesAction implements Action { // TODO
    readonly type = SAVE_ITEM_ATTRIBUTES_VALUES;
    constructor(public appId: number, public item: Item, public updateValues: { [key: string]: any },
        public existingLanguageKey: string, public defaultLanguage: string) { }
}

export class SaveItemAttributesValuesSuccessAction implements Action { // TODO
    readonly type = SAVE_ITEM_ATTRIBUTES_VALUES_SUCCESS;
    // TODO: finish this with true values
    constructor(public data: any) { }
}

export class SaveItemAttributesValuesErrorAction implements Action { // TODO
    readonly type = SAVE_ITEM_ATTRIBUTES_VALUES_ERROR;
    // TODO: finish this with true values
    constructor(public error: any) { }
}

export type Actions
    = SaveItemAttributesValuesAction
    | SaveItemAttributesValuesSuccessAction
    | SaveItemAttributesValuesErrorAction;
