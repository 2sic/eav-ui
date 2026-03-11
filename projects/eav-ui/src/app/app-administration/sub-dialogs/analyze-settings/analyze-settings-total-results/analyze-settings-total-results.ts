import { Component } from '@angular/core';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { AgGridActionsBaseComponent } from '../../../../shared/ag-grid/ag-grid-actions-base';
import { SettingsStackItem } from '../analyze-settings.models';

@Component({
  selector: 'app-analyze-settings-total-results',
  templateUrl: './analyze-settings-total-results.html',
  styleUrls: ['./analyze-settings-total-results.scss'],
  imports: [MatIconModule, MatRippleModule],
})
export class AnalyzeSettingsTotalResultsComponent
  extends AgGridActionsBaseComponent<SettingsStackItem, 'openDetails'> {

  get totalResults(): number { return this.data?.TotalResults ?? 0; }

  openDetails(): void {
    this.do('openDetails');
  }
}