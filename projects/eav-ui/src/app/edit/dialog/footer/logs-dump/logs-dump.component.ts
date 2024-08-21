import { Component } from '@angular/core';
import { ExtendedModule } from '@angular/flex-layout/extended';
import { NgClass, AsyncPipe, DatePipe } from '@angular/common';
import { LogEntry, LoggingService, LogSeverities } from '../../../shared/services/logging.service';

@Component({
  selector: 'app-logs-dump',
  templateUrl: './logs-dump.component.html',
  styleUrls: ['./logs-dump.component.scss'],
  standalone: true,
  imports: [
    NgClass,
    ExtendedModule,
    AsyncPipe,
    DatePipe,
  ],
})
export class LogsDumpComponent {
  LogSeverities = LogSeverities;

  protected logs = this.loggingService.getLogsSignal();

  constructor(private loggingService: LoggingService) { }

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
