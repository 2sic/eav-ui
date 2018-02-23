import { Action } from '@ngrx/store';

import { Item } from '../../models/eav/item';
import { EavAttributes } from '../../models/eav';


export const UPDATE_ATTRIBUTES = '[Item Attributes] UPDATE_ATTRIBUTES ';

/**
 * Update
 */
export class UpdateAttributesAction implements Action {
    readonly type = UPDATE_ATTRIBUTES;
    constructor(public attributes: EavAttributes) {
        console.log('zva sam akciju', attributes)
    }
}

export type Actions
    = UpdateAttributesAction;
