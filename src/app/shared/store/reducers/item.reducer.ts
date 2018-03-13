import { Item } from '../../models/eav/item';
import * as fromItems from './../actions/item.actions';
import { AppState } from '../../models/app-state';

export interface ItemState {
    items: Item[];
}

export const initialState: ItemState = {
    items: new Array<Item>()
};

export function itemReducer(state = initialState, action: fromItems.Actions): ItemState {
    switch (action.type) {
        case fromItems.LOAD_ITEM_SUCCESS: {
            console.log('loadsucess item: ', action.newItem);
            return {
                ...state,
                ...{ items: [...state.items, action.newItem] }
            };
        }
        // case fromItems.UPDATE_ITEM: {
        //     return state.map(item => {
        //         // return item.entity.id === action.item.entity.id
        //         //     ? { ...item, ...action.item }
        //         //     : item;
        //         if (item.entity.id === action.item.entity.id) {
        //             item.entity.attributes = { ...action.item.entity.attributes }
        //         }
        //         return item;
        //     });

        //     // const ovajItem: Item = state.find(item => item.entity.id === action.item.entity.id);
        //     // return [{
        //     //     ...ovajItem,
        //     //     entity: {
        //     //         ...ovajItem.entity,
        //     //         attributes: action.item.entity.attributes
        //     //     }
        //     // }]
        //     // ];
        // }
        case fromItems.UPDATE_ITEM: {
            console.log('action.attributes', action.attributes);
            return {
                ...state,
                ...{
                    items: state.items.map(item => {
                        return item.entity.id === action.id
                            //  ? { ...item, ...action }

                            // return item.entity.id === action.id
                            //  ? { ...item, ...{ header: {... item.header}, entity: this.entityReducer(item.entity, action) } }

                            ? {
                                ...item,
                                header: { ...item.header },
                                entity: {
                                    id: item.entity.id,
                                    version: item.entity.version,
                                    guid: item.entity.guid,
                                    type: { ...item.entity.type },
                                    attributes: { ...action.attributes },
                                    owner: item.entity.owner,
                                    metadata: [...item.entity.metadata],
                                }
                            }
                            : item;
                    })
                }
            };

            // 'BooleanDefault': this.eavValuesReducer(state['BooleanDefault'], action)
            // values: [{ value: state.values[0].value, dimensions: [] }]

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
            return {
                ...state,
                ...{
                    items: state.items.filter(item => item.entity.id !== action.item.entity.id)
                }
            };
        default: {
            return state;
        }
    }
}

export const getItems = (state: ItemState) => state.items;
