/* import { ContentType } from '../models';
import * as fromContentType from './../actions/content-type.actions';

const initialState: ContentType[] = [{
    id: 1,
    name: 'initial contentType'
},
{
    id: 2,
    name: 'initial contentType 2'
}];

export function contentTypeReducer(state = initialState, action: fromContentType.Actions): ContentType[] {
    switch (action.type) {
        case fromContentType.LOAD_CONTENT_TYPE_SUCCESS: {
            return action.payload;
        }
        default: {
            return state;
        }
    }
} */
