import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TippyDirective } from '../../../../shared/directives/tippy.directive';
import { LogManager } from '../../../../shared/logging/log-manager';
import { LoggingService, LogSeverities } from '../../../shared/services/logging.service';
import { ConfigEditorDialogComponent } from '../logs-config/config-editor-dialog/config-editor-dialog.component';
import { SpecsEditorDialogComponent } from '../logs-config/specs-editor-dialog/specs-editor-dialog.component';

@Component({
  selector: 'app-logs-config',
  templateUrl: './logs-config.component.html',
  styleUrls: ['./logs-config.component.scss'],
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    TippyDirective,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    FormsModule,
    MatInputModule,
  ]
})
export class LogsConfigComponent {
  LogSeverities = LogSeverities;
  logManager = LogManager.singleton();
  allLogs = this.logManager.mergeAllSpecs;
  configs: string[] = [];
  sessionPrefix = 'logSpecs';
  selectedFilter: "activated" | "deactivated" | "";
  selectedConfig: string | null = null;
  searchTerm: string = '';

  protected logs = this.loggingService.getLogsSignal();

  constructor(
    private loggingService: LoggingService,
    private matDialog: MatDialog,
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
          this.logManager.toggle(spec);
        }
      }
    } else {
      for (const spec of Object.keys(this.allLogs)) {
        if (!this.isChecked(spec)) {
          this.logManager.toggle(spec);
        }
      }
    }

    this.applyFilters();
  }

  onFilterSelected(filter: "activated" | "deactivated" | ""): void {
    this.selectedFilter = filter;
    this.applyFilters();
  }

  filterLogs(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.searchTerm = inputElement.value.toLowerCase(); // Store the search term
    this.applyFilters();
  }

  isChecked(name: string): boolean {
    return this.allLogs[name]?.enabled ?? false;
  }

  toggleConfig(name: string): void {
    this.logManager.toggle(name);
    this.applyFilters();
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
    this.selectedConfig = configName;
  }

  private applyFilters(): void {
 
    let filteredLogs = Object.entries(this.logManager.mergeAllSpecs); // Always start from full logs
  
    if (this.searchTerm) {
      filteredLogs = filteredLogs.filter(([key]) => key.toLowerCase().includes(this.searchTerm));
    }
  
    if (this.selectedFilter === 'activated') {
      filteredLogs = filteredLogs.filter(([, log]) => log.enabled);
    } else if (this.selectedFilter === 'deactivated') {
      filteredLogs = filteredLogs.filter(([, log]) => !log.enabled);
    }
  
    this.allLogs = Object.fromEntries(filteredLogs);
  }

  saveConfig(): void {
    const configName = prompt('Enter the config name:');
  
    if (configName) {
      // Save all activated logs, irrespective of the filters
      const enabledConfigs = Object.fromEntries(
        Object.entries(this.logManager.mergeAllSpecs).filter(
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

    if (configData && Object.keys(configData).length > 0) {
      this.matDialog.open(ConfigEditorDialogComponent, {
        width: '800px',
        data: { configData },
      });
    } else {
      this.snackBar.open(`No active logs to export for "${this.selectedConfig}".`, null, {
        duration: 2000,
      });
    }
    
    this.applyFilters();
  }

  /* Specs Editor Dialog Functions */
  hasLogSpecs(logKey: string): boolean {
    const specs = this.allLogs[logKey]?.specs;
    return !!specs && Object.keys(specs).length > 0;
  }

  openLogSpecs(logKey: string): void {
    let logSpecs = this.allLogs[logKey].specs;
    const dialogRef = this.matDialog.open(SpecsEditorDialogComponent, {
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
