import { Item } from '../models/item';
import * as fromItems from './../actions/item.actions';

const initialState: Item[] = [{
    id: 1,
    name: 'initital'
}];

export function itemReducer(state = initialState, action: fromItems.Actions): Item[] {
    switch (action.type) {
        case fromItems.LOAD_ITEMS_SUCCESS: {
            return action.payload;
        }
        default: {
            return state;
        }
    }
}
