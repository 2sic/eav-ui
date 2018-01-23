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
            if (state[0] !== action.newContentType) {
                console.log('state[0]', state[0]);
                console.log('saction.newContentType', action.newContentType);
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

