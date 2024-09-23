import { Component } from '@angular/core';
import { ExtendedModule } from '@angular/flex-layout/extended';
import { NgClass, AsyncPipe, DatePipe } from '@angular/common';
import { LogEntry, LoggingService, LogSeverities } from '../../../shared/services/logging.service';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { LogsConfigComponent } from "../log-config/logs-config.component";
import { TippyDirective } from 'projects/eav-ui/src/app/shared/directives/tippy.directive';

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
    MatIconModule,
    MatButtonModule,
    LogsConfigComponent,
    TippyDirective,
],
})
export class LogsDumpComponent {
  LogSeverities = LogSeverities;
  showSettings = false;

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

  toggleDialog(): void {
    this.showSettings = !this.showSettings;
  }
}

