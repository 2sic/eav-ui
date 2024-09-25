import { Injectable, OnDestroy, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject, Observable } from 'rxjs';
import { Of } from '../../../core';

/**
 * Logging service - ATM not really used, but would be great
 * to show logs in the debug-panel.
 * So don't delete - reconsider how to use.
 */
@Injectable()
export class LoggingService implements OnDestroy {
  private logs$ = new BehaviorSubject<LogEntry[]>([]);
  private logLimit = 50;
  private lastSnackBarTime = 0;
  private snackBarDebounce = 10000;

  constructor(private snackBar: MatSnackBar) { }

  ngOnDestroy(): void {
    this.logs$.complete();
  }

  addLog(severity: Of<typeof LogSeverities>, label: string, error: any): void {
    const newLogEntry: LogEntry = {
      error,
      label,
      severity,
      time: Date.now(),
    };
    const oldLogs = this.logs$.value;
    const newLogs = [newLogEntry, ...oldLogs.slice(0, this.logLimit - 2)];
    this.logs$.next(newLogs);
  }

  /** Show snackBar to the user. By default snackBars have debounce timer, but you can force snackBar to show instantly */
  showMessage(message: string, duration: number, force?: boolean): void {
    const nowTime = Date.now();
    if (!force && (nowTime - this.lastSnackBarTime) <= this.snackBarDebounce) {
      return;
    }

    if (duration != null && duration > 0) {
      this.snackBar.open(message, null, { duration });
    } else {
      this.snackBar.open(message);
    }
    this.lastSnackBarTime = nowTime;
  }

  getLogs$(): Observable<LogEntry[]> {
    return this.logs$.asObservable();
  }

  getLogsSignal(): Signal<LogEntry[]> {
    return toSignal(this.logs$);
  }

}


export interface LogEntry {
  error: any;
  label: string;
  severity: Of<typeof LogSeverities>;
  time: number;
}

export const LogSeverities = {
  Error: 'error',
  Log: 'log',
  Warn: 'warn',
} as const /* the as const ensures that the keys/values can be strictly checked */;
