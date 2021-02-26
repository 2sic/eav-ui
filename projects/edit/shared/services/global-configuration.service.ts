import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import * as fromStore from '../store';
import * as GlobalConfigurationActions from '../store/actions/global-configuration.actions';

@Injectable({ providedIn: 'root' })
export class GlobalConfigService {
  constructor(private store: Store<fromStore.EavState>, private snackBar: MatSnackBar) { }

  loadDebugEnabled(debugEnabled: boolean) {
    this.store.dispatch(GlobalConfigurationActions.loadDebugEnabled({ debugEnabled }));
  }

  toggleDebugEnabled() {
    this.store.dispatch(GlobalConfigurationActions.toggleDebugEnabled());
    let debugEnabled: boolean;
    this.store.select(fromStore.selectDebugEnabled).pipe(take(1)).subscribe(enabled => {
      debugEnabled = enabled;
    });
    if (debugEnabled) {
      this.snackBar.open('debug mode enabled', null, { duration: 3000 });
    } else {
      this.snackBar.open('debug mode disabled', null, { duration: 3000 });
    }
  }

  getDebugEnabled(): Observable<boolean> {
    return this.store.select(fromStore.selectDebugEnabled);
  }
}
