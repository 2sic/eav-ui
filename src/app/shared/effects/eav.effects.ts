import { Injectable } from '@angular/core';
import { Actions } from '@ngrx/effects';

import { EavService } from '../services/eav.service';
// import * as itemActions from '../store/actions/item.actions';

@Injectable()
export class EavEffects {
    constructor(
        private actions$: Actions,
        private eavService: EavService
    ) { }

    // @Effect() saveItem$ = this.actions$
    //     .ofType(fromItems.SAVE_ITEM_ATTRIBUTES_VALUES)
    //     .switchMap((action: fromItems.SaveItemAttributesValuesAction) => {
    //         console.log('SAVE_ITEM_ATTRIBUTES_VALUES EFFECT');
    //         return this.eavService.submit(action.appId)
    //             .map(data => new fromItems.SaveItemAttributesValuesSuccessAction(data));
    //     })
    //     .catch(err => (of(new fromItems.SaveItemAttributesValuesErrorAction(err))));


}

