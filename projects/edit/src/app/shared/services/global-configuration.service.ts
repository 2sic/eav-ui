import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import * as fromStore from '../store';
import * as globalConfigurationActions from '../store/actions/global-configuration.actions';

@Injectable({
  providedIn: 'root'
})
export class GlobalConfigurationService {

  constructor(
    private store: Store<fromStore.EavState>,
  ) { }

  public loadDebugEnabled(debugEnabled: boolean) {
    this.store.dispatch(new globalConfigurationActions.LoadDebugEnabledAction(debugEnabled));
  }

  public getDebugEnabled(): Observable<boolean> {
    return this.store.select(fromStore.getDebugEnabled);
  }
}
