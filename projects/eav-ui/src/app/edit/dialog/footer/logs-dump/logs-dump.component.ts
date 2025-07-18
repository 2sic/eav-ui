import { DatePipe, NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TippyDirective } from '../../../../shared/directives/tippy.directive';
import { LogEntry, LoggingService, LogSeverities } from '../../../shared/services/logging.service';
import { LogsConfigComponent } from "../logs-config/logs-config.component";

@Component({
    selector: 'app-logs-dump',
    templateUrl: './logs-dump.component.html',
    styleUrls: ['./logs-dump.component.scss'],
    imports: [
        NgClass,
        DatePipe,
        MatIconModule,
        MatButtonModule,
        LogsConfigComponent,
        TippyDirective,
    ]
})
export class LogsDumpComponent {
  LogSeverities = LogSeverities;
  showSettings = true;

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

  showLogSettings(show: boolean): void {
    this.showSettings = show;
  }
}

