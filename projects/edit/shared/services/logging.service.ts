import { Injectable, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject, Observable } from 'rxjs';
import { LogEntry, LogSeverity } from '../models';

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

  addLog(severity: LogSeverity, label: string, error: any): void {
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
}
