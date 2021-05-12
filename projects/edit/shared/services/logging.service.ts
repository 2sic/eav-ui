import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { LogEntry, LogSeverity } from '../models/log-entry.model';

@Injectable()
export class LoggingService implements OnDestroy {
  private logs$ = new BehaviorSubject<LogEntry[]>([]);
  private logLimit = 50;

  constructor() { }

  ngOnDestroy(): void {
    this.logs$.complete();
  }

  add(severity: LogSeverity, label: string, error: any): void {
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

  getLogs$(): Observable<LogEntry[]> {
    return this.logs$.asObservable();
  }
}
