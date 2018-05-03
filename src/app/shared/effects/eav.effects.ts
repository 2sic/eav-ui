import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import * as fromItems from '../store/actions/item.actions';

import { EavService } from '../services/eav.service';
// import * as itemActions from '../store/actions/item.actions';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/catch';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';

@Injectable()
export class EavEffects {
    constructor(
        private actions$: Actions,
        private eavService: EavService
    ) { }

    @Effect() saveItem$ = this.actions$
        .ofType(fromItems.SAVE_ITEM_ATTRIBUTES_VALUES)
        .switchMap((action: fromItems.SaveItemAttributesValuesAction) => {
            console.log('SAVE_ITEM_ATTRIBUTES_VALUES EFFECT');
            return this.eavService.submit(action.appId)
                .map(data => new fromItems.SaveItemAttributesValuesSuccessAction(data));
        })
        .catch(err => (of(new fromItems.SaveItemAttributesValuesErrorAction(err))));

    //   @Effect() addStory$ = this.actions$
    //   .ofType(ADD_STORY)
    //   .switchMap(action =>
    //     this.storyService.add(action.payload)
    //     .switchMap(story => (Observable.from([{
    //       type: 'ADD_STORY_SUCCESS'
    //     }, formSuccessAction('newStory')])))
    //     .catch(err => (Observable.of(formErrorAction('newStory', err))))
    //   )
}

