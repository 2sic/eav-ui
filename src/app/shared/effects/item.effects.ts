// import { Injectable } from '@angular/core';
// import { Actions, Effect, ofType } from '@ngrx/effects';
// import * as fromItems from '../store/actions/item.actions';
// import { map, switchMap } from 'rxjs/operators';

// import { ItemService } from '../services/item.service';
// import * as itemActions from '../store/actions/item.actions';



// @Injectable()
// export class ItemEffects {
//     constructor(
//         private actions$: Actions,
//         private itemService: ItemService
//     ) { }

//     /**
//      * Efect on Action (LOAD_EAV_ITEMS) load EavItem and sent it to store with action LoadEavItemsSuccessAction
//      */
//     @Effect() loadItem$ = this.actions$
//         .pipe(ofType(itemActions.LOAD_ITEM),
//             switchMap((action: fromItems.LoadItemAction) => {
//                 return this.itemService.getItemFromJsonItem1(action.path)
//                     .pipe(map(item => new itemActions.LoadItemSuccessAction(item)));
//             }));


//     // @Effect() saveItem$ = this.actions$
//     //     .ofType(itemActions.SAVE_ITEM_ATTRIBUTES_VALUES)
//     //     .switchMap((action: fromItems.SaveItemAttributesValuesAction) => {
//     //         return this.itemService.submit(action.id)
//     //             .map(item => new itemActions.SaveItemAttributesValuesSuccessAction(item));
//     //     })
//     //     .catch(err => (Observable.of(new itemActions.SaveItemAttributesValuesErrorAction(err))));

// }

