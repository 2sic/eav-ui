import { Item } from '../../models/eav/item';
import * as fromItems from '../actions/item.actions';
import { LocalizationHelper } from '../../helpers/localization-helper';

export interface ItemState {
    items: Item[];
}

export const initialState: ItemState = {
    items: []
};

export function itemReducer(state = initialState, action: fromItems.Actions): ItemState {
    switch (action.type) {
        case fromItems.SAVE_ITEM_ATTRIBUTES_VALUES: {
            console.log('action.attribute', action);
            return {
                ...state,
                ...{
                    items: state.items.map(item => {

                        return (item.entity.id === 0
                            ? item.entity.guid === action.item.entity.guid
                            : item.entity.id === action.item.entity.id)
                            ? {
                                ...item,
                                entity: {
                                    ...item.entity,
                                    attributes: LocalizationHelper.updateAttributesValues(item.entity.attributes,
                                        action.updateValues, action.existingLanguageKey, action.defaultLanguage)
                                }
                            }
                            : item;
                    })
                }
            };
        }
        default: {
            return state;
        }
    }
}

export const getItems = (state: ItemState) => state.items;
