import { Injectable } from '@angular/core';
import { Actions, Effect, toPayload } from '@ngrx/effects';
import * as fromItems from '../store/actions/item.actions';

import { ItemService } from '../services/item.service';
import * as itemActions from '../store/actions/item.actions';
import 'rxjs/add/operator/switchMap';

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
}
