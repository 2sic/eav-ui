import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import * as fromItems from '../store/actions/item.actions';

import { ItemService } from '../services/item.service';
import * as itemActions from '../store/actions/item.actions';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/catch';

@Injectable()
export class ItemEffects {
    constructor(
        private actions$: Actions,
        private itemService: ItemService
    ) { }

    /**
     * Efect on Action (LOAD_EAV_ITEMS) load EavItem and sent it to store with action LoadEavItemsSuccessAction
     */
    @Effect() loadItem$ = this.actions$
        .ofType(itemActions.LOAD_ITEM)
        .switchMap((action: fromItems.LoadItemAction) => {
            return this.itemService.getItemFromJsonItem1(action.path)
                .map(item => new itemActions.LoadItemSuccessAction(item));
        });


    // @Effect() saveItem$ = this.actions$
    //     .ofType(itemActions.SAVE_ITEM_ATTRIBUTES_VALUES)
    //     .switchMap((action: fromItems.SaveItemAttributesValuesAction) => {
    //         return this.itemService.submit(action.id)
    //             .map(item => new itemActions.SaveItemAttributesValuesSuccessAction(item));
    //     })
    //     .catch(err => (Observable.of(new itemActions.SaveItemAttributesValuesErrorAction(err))));


    //         @Effect() addStory$ = this.actions$
    //   .ofType(ADD_STORY)
    //   .switchMap(action =>
    //     this.storyService.add(action.payload)
    //     .switchMap(story => (Observable.from([{
    //       type: 'ADD_STORY_SUCCESS'
    //     }, formSuccessAction('newStory')])))
    //     .catch(err => (Observable.of(formErrorAction('newStory', err))))
    //   )
}

