import { Injectable } from '@angular/core';
import { Actions, Effect, toPayload } from '@ngrx/effects';

import { ContentTypeService } from '../services/content-type.service';
import * as contentTypeActions from '../store/actions/content-type.actions';
import 'rxjs/add/operator/switchMap';
import { ContentType } from '../models/eav/content-type';
import { Observable } from 'rxjs/Observable';

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
        .ofType(contentTypeActions.LOAD_CONTENT_TYPE)
        .switchMap(() => {
            return this.contentTypeService.getContentTypeFromJsonContentType1()
                .map(contentType => new contentTypeActions.LoadContentTypeSuccessAction(contentType));
        });
}
