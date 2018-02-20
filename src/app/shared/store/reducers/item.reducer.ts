import { Item } from '../../models/eav/item';
import * as fromItems from './../actions/item.actions';
import { AppState } from '../../models/app-state';

/**
 * Receave action.newItem and push it in Items[] array to store
 * @param state
 * @param action
 */
export function itemReducer(state: Item[] = new Array<Item>(), action: fromItems.Actions): Item[] {
    switch (action.type) {
        case fromItems.LOAD_ITEM_SUCCESS: {
            return [...state, action.newItem];
        }
        case fromItems.UPDATE_ITEM: {
            return state.map(item => {
                // return item.entity.id === action.item.entity.id
                //     ? { ...item, ...action.item }
                //     : item;
                if (item.entity.id === action.item.entity.id) {
                    item.entity.attributes = { ...action.item.entity.attributes }
                }
                return item;
            });

            // const ovajItem: Item = state.find(item => item.entity.id === action.item.entity.id);
            // return [{
            //     ...ovajItem,
            //     entity: {
            //         ...ovajItem.entity,
            //         attributes: action.item.entity.attributes
            //     }
            // }]
            // ];
        }
        case fromItems.DELETE_ITEM:
            return state.filter(item => item.entity.id !== action.item.entity.id);
        default: {
            return state;
        }
    }
}
