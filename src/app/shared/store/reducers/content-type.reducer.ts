import { ContentType } from '../../models/eav';
import * as fromContentType from './../actions/content-type.actions';
import { AppState } from '../../models/app-state';

/**
 * Receave ContentType and push it in ContentType[] array to store
 * @param state
 * @param action
 */
export function contentTypeReducer(state: ContentType[] = [], action: fromContentType.Actions): ContentType[] {
    switch (action.type) {
        case fromContentType.LOAD_CONTENT_TYPE_SUCCESS: {
            // if contentType with same id exist in store don't load content
            const contentTypes = state.filter(contentType => contentType.contentType.id === action.newContentType.contentType.id);
            if (contentTypes.length === 0) {
                return [...state, action.newContentType];
            } else {
                return state;
            }
        }
        default: {
            return state;
        }
    }
}

