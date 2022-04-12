import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { Component } from '@angular/core';
import { SettingsStackItem } from '../analyze-settings.models';
import { AnalyzeSettingsTotalResultsParams } from './analyze-settings-total-results.models';

@Component({
  selector: 'app-analyze-settings-total-results',
  templateUrl: './analyze-settings-total-results.component.html',
  styleUrls: ['./analyze-settings-total-results.component.scss'],
})
export class AnalyzeSettingsTotalResultsComponent implements ICellRendererAngularComp {
  totalResults: number;

  private stackItem: SettingsStackItem;
  private params: AnalyzeSettingsTotalResultsParams;

  constructor() { }

  agInit(params: AnalyzeSettingsTotalResultsParams) {
    this.totalResults = params.value;
    this.params = params;
    this.stackItem = this.params.data;
  }

  refresh(params?: any): boolean {
    return true;
  }

  openDetails() {
    this.params.openDetails(this.stackItem);
  }
}
