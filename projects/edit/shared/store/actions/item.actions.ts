import { Action } from '@ngrx/store';

import { Item } from '../../models/eav/item';
import { SaveResult } from '../../models/eav/save-result.model';

// Item Attributes
export const SAVE_ITEM_ATTRIBUTES_VALUES = '[Item] SAVE_ITEM_ATTRIBUTES_VALUES';
export const SAVE_ITEM_ATTRIBUTES_VALUES_SUCCESS = '[Item] SAVE_ITEM_ATTRIBUTES_VALUES_SUCCESS';
export const SAVE_ITEM_ATTRIBUTES_VALUES_ERROR = '[Item] SAVE_ITEM_ATTRIBUTES_VALUES_ERROR';

/** Save (submit) */
export class SaveItemAttributesValuesAction implements Action {
  readonly type = SAVE_ITEM_ATTRIBUTES_VALUES;
  constructor(public item: Item) { }
}

export class SaveItemAttributesValuesSuccessAction implements Action {
  readonly type = SAVE_ITEM_ATTRIBUTES_VALUES_SUCCESS;
  constructor(public data: SaveResult) { }
}

export class SaveItemAttributesValuesErrorAction implements Action {
  readonly type = SAVE_ITEM_ATTRIBUTES_VALUES_ERROR;
  constructor(public error: any) { }
}

export type Actions
  = SaveItemAttributesValuesAction
  | SaveItemAttributesValuesSuccessAction
  | SaveItemAttributesValuesErrorAction;
