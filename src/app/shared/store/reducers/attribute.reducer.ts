import { Item } from '../../models/eav/item';
import * as fromItems from './../actions/item.actions';
import { AppState } from '../../models/app-state';
import { EavValues } from '../../models/eav/eav-values';

export interface AttributesState {
    attributes: { [key: string]: EavValues<any> };
}

export const initialState: AttributesState = {
    attributes: {}
};

export function attributeReducer(state = initialState, action: fromItems.Actions): AttributesState {
    switch (action.type) {
        case fromItems.UPDATE_ITEM: {
            console.log('action.attributes', action.attributes);
            return {
                ...state,
                ...{ attributes: action.attributes }
            };
        }
    }
}

export const getAttributes = (state: AttributesState) => state.attributes;
