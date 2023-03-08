import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EntityCollectionServiceElementsFactory } from '@ngrx/data';
import { distinctUntilChanged, map, Observable } from 'rxjs';
import { keyDebug } from '../../../../shared/constants/session.constants';
import { GlobalConfig } from '../../models';
import { BaseDataService } from './base-data.service';

@Injectable({ providedIn: 'root' })
export class GlobalConfigService extends BaseDataService<GlobalConfig> {
  constructor(serviceElementsFactory: EntityCollectionServiceElementsFactory, private snackBar: MatSnackBar) {
    super('GlobalConfig', serviceElementsFactory);

    const initial: GlobalConfig = {
      id: 0,
      debugEnabled: sessionStorage.getItem(keyDebug) === 'true',
      allowDebugMode: false,
    };
    this.addOneToCache(initial);
  }

  allowDebug(allow: boolean): void {
    const oldConfig = this.cache$.value[0];
    if (oldConfig.allowDebugMode === allow) { return; }

    const newConfig: GlobalConfig = {
      ...oldConfig,
      allowDebugMode: allow,
    };
    this.updateOneInCache(newConfig);
  }

  getDebugEnabled(): boolean {
    return this.cache$.value[0].allowDebugMode && this.cache$.value[0].debugEnabled;
  }

  getDebugEnabled$(): Observable<boolean> {
    return this.cache$.pipe(
      map(configs => configs[0].allowDebugMode && configs[0].debugEnabled),
      distinctUntilChanged(),
    );
  }

  toggleDebugEnabled(): void {
    const oldConfig = this.cache$.value[0];
    if (!oldConfig.allowDebugMode) {
      this.snackBar.open('You do not have permissions to enter developer mode', null, { duration: 3000 });
      return;
    }

    const newConfig: GlobalConfig = {
      ...oldConfig,
      debugEnabled: !oldConfig.debugEnabled,
    };
    this.updateOneInCache(newConfig);
    this.snackBar.open(newConfig.debugEnabled ? 'developer mode on' : 'developer mode off', null, { duration: 3000 });
  }
}
