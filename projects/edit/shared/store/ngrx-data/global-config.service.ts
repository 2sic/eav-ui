import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EntityCollectionServiceBase, EntityCollectionServiceElementsFactory } from '@ngrx/data';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { keyDebug } from '../../../../ng-dialogs/src/app/shared/constants/session.constants';
import { GlobalConfig } from '../../models';

@Injectable({ providedIn: 'root' })
export class GlobalConfigService extends EntityCollectionServiceBase<GlobalConfig> {
  private globalConfig$: BehaviorSubject<GlobalConfig>;

  constructor(serviceElementsFactory: EntityCollectionServiceElementsFactory, private snackBar: MatSnackBar) {
    super('GlobalConfig', serviceElementsFactory);

    const initial: GlobalConfig = {
      id: 0,
      debugEnabled: sessionStorage.getItem(keyDebug) === 'true',
    };
    this.addOneToCache(initial);
    this.globalConfig$ = new BehaviorSubject<GlobalConfig>(initial);
    // doesn't need to be completed because store services are singletons that live as long as the browser tab is open
    this.entities$.subscribe(globalConfigs => {
      this.globalConfig$.next(globalConfigs[0]);
    });
  }

  getDebugEnabled$(): Observable<boolean> {
    return this.globalConfig$.pipe(map(config => config.debugEnabled));
  }

  toggleDebugEnabled(): void {
    const oldConfig = this.globalConfig$.value;
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
