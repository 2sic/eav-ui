import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EntityCollectionServiceElementsFactory } from '@ngrx/data';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { keyDebug } from '../../../../ng-dialogs/src/app/shared/constants/session.constants';
import { GlobalConfig } from '../../models';
import { BaseDataService } from './base-data.service';

@Injectable({ providedIn: 'root' })
export class GlobalConfigService extends BaseDataService<GlobalConfig> {
  constructor(serviceElementsFactory: EntityCollectionServiceElementsFactory, private snackBar: MatSnackBar) {
    super('GlobalConfig', serviceElementsFactory);

    const initial: GlobalConfig = {
      id: 0,
      debugEnabled: sessionStorage.getItem(keyDebug) === 'true',
    };
    this.addOneToCache(initial);
  }

  getDebugEnabled(): boolean {
    return this.cache$.value[0].debugEnabled;
  }

  getDebugEnabled$(): Observable<boolean> {
    return this.cache$.pipe(map(configs => configs[0].debugEnabled));
  }

  toggleDebugEnabled(): void {
    const oldConfig = this.cache$.value[0];
    const newConfig: GlobalConfig = {
      ...oldConfig,
      debugEnabled: !oldConfig.debugEnabled,
    };
    this.updateOneInCache(newConfig);

    if (newConfig.debugEnabled) {
      this.snackBar.open('debug mode enabled', null, { duration: 3000 });
    } else {
      this.snackBar.open('debug mode disabled', null, { duration: 3000 });
    }
  }
}
