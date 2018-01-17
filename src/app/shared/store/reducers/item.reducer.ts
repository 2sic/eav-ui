import { EavItem } from '../../models/eav/eav-item';
import * as fromItems from './../actions/item.actions';

/* const initialState: EavItem = {
    header: {},
    entity: {}
}; */

export function itemReducer(state: EavItem, action: fromItems.Actions): EavItem {
    switch (action.type) {
        case fromItems.LOAD_EAV_ITEMS_SUCCESS: {
            return action.payload;
        }
        default: {
            return state;
        }
    }
}
