
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import * as languageActions from '../store/actions/input-type.actions';
import * as fromStore from '../store';
import { InputType } from '../models/eav';

@Injectable()
export class InputTypeService {
  constructor(private store: Store<fromStore.EavState>) {
  }

  /**
    * Load all inputtypes info
    */
  public loadInputTypes(inputTypes: InputType[]) {
    this.store.dispatch(new languageActions.LoadInputTypeSuccessAction(inputTypes));
  }

  /**
  * Observe input type from store
  * @param type
  */
  public getContentTypeById(type: string): Observable<InputType> {
    return this.store
      .select(fromStore.getInputTypes)
      .pipe(
        map(data => data.find(obj => obj.Type === type))
      );
  }
}

