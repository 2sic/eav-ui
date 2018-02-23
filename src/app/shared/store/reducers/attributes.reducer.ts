//         return item;
import { Item } from '../../models/eav/item';
import * as fromItems from './../actions/item.actions';
import * as fromAttributes from './../actions/attributes.action'
// './../actions/attributes.actions';
import { AppState } from '../../models/app-state';
import { EavAttributes, EavValue } from '../../models/eav';
import { EavValues } from '../../models/eav/eav-values';

/**
 * Receave action.newItem and push it in Items[] array to store
 * @param state
 * @param action
 */
export function attributesReducer(state: EavAttributes = new EavAttributes(), action: fromAttributes.Actions): EavAttributes {
    switch (action.type) {

        case fromAttributes.UPDATE_ATTRIBUTES:
            console.log('ovo moj state:', state['BooleanDefault']);
            return { ...state, 'BooleanDefault': this.eavValuesReducer(state['BooleanDefault'], action) }
        default: {
            return state;
        }
    }
}

export function eavValuesReducer(state: EavValues<any> = new EavValues([]), action: fromAttributes.Actions): EavValues<any> {
    switch (action.type) {

        case fromAttributes.UPDATE_ATTRIBUTES: {
            return { ...state, values: [{ value: state.values[0].value, dimensions: [] }] }
            // if (item.entity.id === action.item.entity.id) {
            //     item.entity.attributes = { ...action.item.entity.attributes }
            // }
            // return item;
        };
        default: {
            return state;
        }
    }
}

