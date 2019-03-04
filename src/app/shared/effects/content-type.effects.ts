import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { map, switchMap } from 'rxjs/operators';

import { ContentTypeService } from '../services/content-type.service';
import * as contentTypeActions from '../store/actions/content-type.actions';

import * as fromContentType from '../store/actions/content-type.actions';

@Injectable()
export class ContentTypeEffects {
    constructor(
        private actions$: Actions,
        private contentTypeService: ContentTypeService
    ) { }

    /**
     * Efect on Action (LOAD_EAV_CONTENTTYPES) load ContentType and sent it to store with action LoadContentTypesSuccessAction
     */
    @Effect() loadContentType$ = this.actions$
        .pipe(ofType(contentTypeActions.LOAD_CONTENT_TYPE),
            switchMap((action: fromContentType.LoadContentTypeAction) => {
                return this.contentTypeService.getContentTypeFromJsonContentType1(action.path)
                    .pipe(map(contentType => new contentTypeActions.LoadContentTypeSuccessAction(contentType)));
            }));
}
