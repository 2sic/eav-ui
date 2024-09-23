import { Component } from '@angular/core';
import { NgClass, AsyncPipe, DatePipe, CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import {
  LoggingService,
  LogSeverities,
} from '../../../shared/services/logging.service';
import { TippyDirective } from '../../../../shared/directives/tippy.directive';
import { LogManager } from 'projects/eav-ui/src/app/shared/logging/log-manager';
import { SpecsEditorDialogComponent } from './specs-editor-dialog/specs-editor-dialog.component';
import { ConfigEditorDialogComponent } from './config-editor-dialog/config-editor-dialog.component';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-logs-config',
  templateUrl: './logs-config.component.html',
  styleUrls: ['./logs-config.component.scss'],
  standalone: true,
  imports: [
    NgClass,
    AsyncPipe,
    DatePipe,
    CommonModule,
    MatIconModule,
    MatButtonModule,
    TippyDirective,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    FormsModule,
    MatInputModule,
  ],
})
export class LogsConfigComponent {
  LogSeverities = LogSeverities;
  logManager = LogManager.singleton();
  allLogs = this.logManager.mergeAllSpecs;
  configs: string[] = [];
  selectedConfig: string | null = null;
  sessionPrefix = 'logSpecs';

  protected logs = this.loggingService.getLogsSignal();

  constructor(
    private loggingService: LoggingService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { this.loadConfigsFromStateManager(); }

  /* Toggle Functions */
  checkAll(): void {
    const allChecked = Object.values(this.allLogs).every(
      (specs) => specs.enabled
    );

    if (allChecked) {
      // Reset all to unchecked
      for (const spec of Object.keys(this.allLogs)) {
        if (this.isChecked(spec)) {
          this.toggleConfig(spec);
        }
      }
    } else {
      for (const spec of Object.keys(this.allLogs)) {
        if (!this.isChecked(spec)) {
          this.toggleConfig(spec);
        }
      }
    }

    this.allLogs = this.logManager.mergeAllSpecs;
  }

  isChecked(name: string): boolean {
    return this.allLogs[name]?.enabled ?? false;
  }

  toggleConfig(name: string): void {
    this.logManager.toggle(name);
    this.allLogs = this.logManager.mergeAllSpecs;
  }

  /* Config Functions */
  loadConfigsFromStateManager(): void {
    const savedConfigs = Object.keys(this.logManager.state.cache).filter(
      (key) => key.startsWith(this.sessionPrefix)
    );
    this.configs = savedConfigs.map((key) =>
      key.replace(`${this.sessionPrefix}.`, '')
    );
  }

  onConfigSelected(configName: string | null): void {
    if (configName) {
      Object.keys(this.allLogs).forEach((logKey) => {
        if (this.isChecked(logKey)) {
          this.toggleConfig(logKey);
        }
      });

      const fullConfigKey = `${this.sessionPrefix}.${configName}`;
      const configData = this.logManager.state.cache[fullConfigKey];

      if (configData) {
        Object.keys(configData).forEach((logKey) => {
          const shouldEnable = (configData as any)[logKey]?.enabled ?? false;
          if (shouldEnable) {
            if (!this.isChecked(logKey)) {
              this.toggleConfig(logKey);
            }
          }
        });
        this.allLogs = this.logManager.mergeAllSpecs;
      }
    }
  }

  saveConfig(): void {
    const configName = prompt('Enter the config name:');

    if (configName) {
      const enabledConfigs = Object.fromEntries(
        Object.entries(this.allLogs).filter(
          ([, config]) => config.enabled
        )
      );

      const fullConfigKey = `${this.sessionPrefix}.${configName}`;
      this.logManager.state.add(fullConfigKey, enabledConfigs);

      this.snackBar.open(`Config "${configName}" has been saved.`, null, {
        duration: 2000,
      });
      this.loadConfigsFromStateManager();
    }
  }

  exportConfig(): void {
    const fullConfigKey = `${this.sessionPrefix}.${this.selectedConfig}`;
    const configData = this.logManager.state.cache[fullConfigKey];

    if (configData) {
      this.dialog.open(ConfigEditorDialogComponent, {
        width: '800px',
        data: { configData },
      });
    } else {
      this.snackBar.open(`Config "${this.selectedConfig}" not found.`, null, {
        duration: 2000,
      });
    }
  }

  /* Specs Editor Dialog Functions */
  hasLogSpecs(logKey: string): boolean {
    const specs = this.allLogs[logKey]?.specs;
    return !!specs && Object.keys(specs).length > 0;
  }

  openLogSpecs(logKey: string): void {
    let logSpecs = this.allLogs[logKey].specs;
    const dialogRef = this.dialog.open(SpecsEditorDialogComponent, {
      width: '800px',
      data: { logSpecs: logSpecs },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const updatedSpecs = JSON.parse(result);

        this.allLogs[logKey].specs = updatedSpecs;

        this.logManager.updateSpecs(this.allLogs);
      }
    });
  }
}
