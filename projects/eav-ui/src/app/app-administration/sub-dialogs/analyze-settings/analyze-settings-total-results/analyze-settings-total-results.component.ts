import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';
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
  private params: ICellRendererParams & AnalyzeSettingsTotalResultsParams;

  agInit(params: ICellRendererParams & AnalyzeSettingsTotalResultsParams): void {
    this.totalResults = params.value;
    this.params = params;
    this.stackItem = this.params.data;
  }

  refresh(params?: any): boolean {
    return true;
  }

  openDetails(): void {
    this.params.openDetails(this.stackItem);
  }
}
