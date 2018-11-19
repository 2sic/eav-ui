import { createSelector } from '@ngrx/store';

import * as fromFeature from '../reducers';
import * as fromContentType from '../reducers/content-type.reducer';

export const getContentTypeState = createSelector(
    fromFeature.getEavState,
    (state: fromFeature.EavState) => state.contentTypeState
);

export const getContentTypes = createSelector(getContentTypeState, fromContentType.getContentTypes);
