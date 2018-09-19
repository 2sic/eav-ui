import { Item } from '../../models/eav/item';
import * as fromItems from '../actions/item.actions';
import { LocalizationHelper } from '../../helpers/localization-helper';
import isEmpty from 'lodash/isEmpty';

export interface ItemState {
    items: Item[];
}

export const initialState: ItemState = {
    items: []
};

export function itemReducer(state = initialState, action: fromItems.Actions): ItemState {
    switch (action.type) {
        case fromItems.LOAD_ITEM_SUCCESS: {
            // if item with same id not exist in store add item else overwrite item
            const itemExist = state.items.filter(data =>
                isEmpty(data.entity.attributes) === false && data.entity.id === action.newItem.entity.id);
            if (itemExist.length === 0) {
                return {
                    ...state,
                    ...{ items: [...state.items, action.newItem] }
                };
            } else {
                return {
                    ...state,
                    ...{
                        items: state.items.map(item => {
                            return item.entity.id === action.newItem.entity.id
                                ? action.newItem
                                : item;
                        })
                    }
                };
            }
        }
        case fromItems.UPDATE_ITEM: {
            console.log('action.attributes', action.attributes);
            return {
                ...state,
                ...{
                    items: state.items.map(item => {
                        return (item.entity.id === 0 ? item.entity.guid === action.guid : item.entity.id === action.id)
                            ? {
                                ...item,
                                entity: {
                                    ...item.entity,
                                    attributes: { ...item.entity.attributes, ...action.attributes },
                                }
                            }
                            : item;
                    })
                }
            };
        }
        case fromItems.UPDATE_ITEM_ATTRIBUTE: {
            console.log('action.attribute', action.attribute);
            return {
                ...state,
                ...{
                    items: state.items.map(item => {

                        return (item.entity.id === 0 ? item.entity.guid === action.guid : item.entity.id === action.id)
                            ? {
                                ...item,
                                entity: {
                                    ...item.entity,
                                    attributes: LocalizationHelper.updateAttribute(item.entity.attributes, action.attribute,
                                        action.attributeKey)

                                }
                            }
                            : item;
                    })
                }
            };
        }
        case fromItems.UPDATE_ITEM_ATTRIBUTE_VALUE: {
            // console.log('action.attribute', action.attribute);
            return {
                ...state,
                ...{
                    items: state.items.map(item => {
                        return (item.entity.id === 0 ? item.entity.guid === action.guid : item.entity.id === action.id)
                            ? {
                                ...item,
                                entity: {
                                    ...item.entity,
                                    attributes: LocalizationHelper.updateAttributeValue(item.entity.attributes, action.attributeKey,
                                        action.attributeValue, action.existingLanguageKey, action.defaultLanguage, action.isReadOnly)
                                }
                            }
                            : item;
                    })
                }
            };
        }
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
        case fromItems.UPDATE_ITEM_ATTRIBUTES_VALUES: {
            console.log('action.attribute', action);
            return {
                ...state,
                ...{
                    items: state.items.map(item => {

                        return (item.entity.id === 0 ? item.entity.guid === action.guid : item.entity.id === action.id)
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
        case fromItems.ADD_ITEM_ATTRIBUTE_VALUE: {
            console.log('ADD_ITEM_ATTRIBUTE_VALUE: ', action);
            return {
                ...state,
                ...{
                    items: state.items.map(item => {
                        return (item.entity.id === 0 ? item.entity.guid === action.guid : item.entity.id === action.id)
                            ? {
                                ...item,
                                entity: {
                                    ...item.entity,
                                    attributes: LocalizationHelper.addAttributeValue(item.entity.attributes,
                                        action.attributeValue, action.attributeKey, action.attributeType)
                                }
                            }
                            : item;
                    })
                }
            };
        }
        case fromItems.ADD_ITEM_ATTRIBUTE_DIMENSION: {
            return {
                ...state,
                ...{
                    items: state.items.map(item => {
                        return (item.entity.id === 0 ? item.entity.guid === action.guid : item.entity.id === action.id)
                            ? {
                                ...item,
                                entity: {
                                    ...item.entity,
                                    attributes: LocalizationHelper.addAttributeDimension(item.entity.attributes,
                                        action.attributeKey, action.dimensionValue, action.existingDimensionValue,
                                        action.defaultLanguage, action.isReadOnly)
                                }
                            }
                            : item;
                    })
                }
            };
        }
        case fromItems.REMOVE_ITEM_ATTRIBUTE_DIMENSION: {
            return {
                ...state,
                ...{
                    items: state.items.map(item => {
                        return (item.entity.id === 0 ? item.entity.guid === action.guid : item.entity.id === action.id)
                            ? {
                                ...item,
                                entity: {
                                    ...item.entity,
                                    attributes: LocalizationHelper.removeAttributeDimension(item.entity.attributes,
                                        action.attributeKey, action.dimensionValue)
                                }
                            }
                            : item;
                    })
                }
            };
        }
        case fromItems.DELETE_ITEM:
            return {
                ...state,
                ...{
                    items: state.items.filter(item => (item.entity.id === 0 ?
                        item.entity.guid !== action.item.entity.guid
                        : item.entity.id !== action.item.entity.id))
                }
            };
        case fromItems.UPDATE_ITEM_HEADER: {
            console.log('action.header', action.header);
            return {
                ...state,
                ...{
                    items: state.items.map(item => {
                        return (item.entity.id === 0 ? item.entity.guid === action.guid : item.entity.id === action.id)
                            ? {
                                ...item,
                                header: {
                                    ...action.header
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
