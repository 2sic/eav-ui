import { ContentType } from '../../models/eav';
import * as fromContentType from './../actions/content-type.actions';

export function contentTypeReducer(state, action: fromContentType.Actions): ContentType {
    switch (action.type) {
        case fromContentType.LOAD_CONTENT_TYPE_SUCCESS: {
            return action.payload;
        }
        default: {
            return state;
        }
    }
}

