import { ContentType } from '../../models/eav';
import * as fromContentType from '../actions/content-type.actions';

export interface ContentTypeState {
    contentTypes: ContentType[];
}

export const initialState: ContentTypeState = {
    contentTypes: []
};

export function contentTypeReducer(state = initialState, action: fromContentType.Actions): ContentTypeState {
    switch (action.type) {
        case fromContentType.LOAD_CONTENT_TYPE_SUCCESS: {
            // if contentType with same id exist in store don't load content
            const contentTypes = state.contentTypes.filter(contentType =>
                contentType.contentType.id === action.newContentType.contentType.id);
            if (contentTypes.length === 0) {
                return { contentTypes: [...state.contentTypes, action.newContentType] };
            } else {
                return state;
            }
        }
        default: {
            return state;
        }
    }
}

export const getContentTypes = (state: ContentTypeState) => state.contentTypes;

