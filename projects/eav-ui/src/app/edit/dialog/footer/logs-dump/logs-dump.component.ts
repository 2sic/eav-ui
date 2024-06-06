import { Component, OnInit } from '@angular/core';
import { combineLatest, map, Observable } from 'rxjs';
import { LogEntry, LogSeverities } from '../../../shared/models';
import { LoggingService } from '../../../shared/services';
import { LogsDumpViewModel } from './logs-dump.component.models';
import { SharedComponentsModule } from '../../../../shared/shared-components.module';
import { ExtendedModule } from '@angular/flex-layout/extended';
import { NgClass, AsyncPipe, DatePipe } from '@angular/common';

@Component({
    selector: 'app-logs-dump',
    templateUrl: './logs-dump.component.html',
    styleUrls: ['./logs-dump.component.scss'],
    standalone: true,
    imports: [
        NgClass,
        ExtendedModule,
        SharedComponentsModule,
        AsyncPipe,
        DatePipe,
    ],
})
export class LogsDumpComponent implements OnInit {
  LogSeverities = LogSeverities;
  viewModel$: Observable<LogsDumpViewModel>;

  constructor(private loggingService: LoggingService) { }

  ngOnInit(): void {
    const logs$ = this.loggingService.getLogs$();
    this.viewModel$ = combineLatest([logs$]).pipe(
      map(([logs]) => {
        const viewModel: LogsDumpViewModel = {
          logs,
        };
        return viewModel;
      }),
    );
  }

  logToConsole(log: LogEntry): void {
    switch (log.severity) {
      case LogSeverities.Log:
        console.log(log.label, log.error);
        break;
      case LogSeverities.Warn:
        console.warn(log.label, log.error);
        break;
      case LogSeverities.Error:
        console.error(log.label, log.error);
        break;
    }
  }
}
