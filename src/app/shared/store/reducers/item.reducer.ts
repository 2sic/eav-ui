import { Item } from '../../models/eav/item';
import * as fromItems from './../actions/item.actions';

/* const initialState: EavItem = {
    header: {},
    entity: {}
}; */

export function itemReducer(state: Item, action: fromItems.Actions): Item {
    switch (action.type) {
        case fromItems.LOAD_ITEMS_SUCCESS: {
            return action.payload;
        }
        default: {
            return state;
        }
    }
}
