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
            return [...state, action.newContentType];
        }
        default: {
            return state;
        }
    }
}

