import { Injectable, computed, signal } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { keyDebug } from '../../../../shared/constants/session.constants';
import { GlobalConfig } from '../../models/global-config.model';
import { toObservable } from '@angular/core/rxjs-interop';

@Injectable({ providedIn: 'root' })
export class GlobalConfigService {

  private debugState = signal<GlobalConfig>(null);
  
  isDebug = computed(() => !!this.debugState()?.allowDebugMode && !!this.debugState()?.debugEnabled);

  /** This observable is a left-over, try to remove once more is refactored */
  debugEnabled$ = toObservable(this.isDebug);

  constructor(private snackBar: MatSnackBar) {
    const initial: GlobalConfig = {
      id: 0,
      debugEnabled: sessionStorage.getItem(keyDebug) === 'true',
      allowDebugMode: false,
    };
    this.debugState.set(initial);
  }

  allowDebug(allow: boolean): void {
    const oldConfig = this.debugState();
    if (oldConfig.allowDebugMode === allow)
      return;

    const newConfig: GlobalConfig = {
      ...oldConfig,
      allowDebugMode: allow,
    };
    this.debugState.set(newConfig);
  }

  toggleDebugEnabled(): void {
    const oldConfig = this.debugState();
    if (!oldConfig.allowDebugMode) {
      this.snackBar.open('You do not have permissions to enter developer mode', null, { duration: 3000 });
      return;
    }

    const newConfig: GlobalConfig = {
      ...oldConfig,
      debugEnabled: !oldConfig.debugEnabled,
    };
    this.debugState.set(newConfig);
    this.snackBar.open(newConfig.debugEnabled ? 'developer mode on' : 'developer mode off', null, { duration: 3000 });
  }
}