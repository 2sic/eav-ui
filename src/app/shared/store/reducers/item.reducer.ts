import { Item } from '../../models/eav/item';
import * as fromItems from './../actions/item.actions';
import { AppState } from '../../models/app-state';

/**
 * Receave action.newItem and push it in Items[] array to store
 * @param state
 * @param action
 */
export function itemReducer(state: Item[] = [], action: fromItems.Actions): Item[] {
    switch (action.type) {
        case fromItems.LOAD_ITEMS_SUCCESS: {
            return [...state, action.newItem];
        }
        default: {
            return state;
        }
    }
}
