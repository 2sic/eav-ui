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

    // @Effect() saveItem$ = this.actions$
    //     .ofType(fromItems.SAVE_ITEM_ATTRIBUTES_VALUES)
    //     .switchMap((action: fromItems.SaveItemAttributesValuesAction) => {
    //         console.log('SAVE_ITEM_ATTRIBUTES_VALUES EFFECT');
    //         return this.eavService.submit(action.appId)
    //             .map(data => new fromItems.SaveItemAttributesValuesSuccessAction(data));
    //     })
    //     .catch(err => (of(new fromItems.SaveItemAttributesValuesErrorAction(err))));


}

