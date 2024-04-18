import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';
import { Component } from '@angular/core';
import { SettingsStackItem } from '../analyze-settings.models';
import { AnalyzeSettingsTotalResultsParams } from './analyze-settings-total-results.models';
import { SharedComponentsModule } from '../../../../shared/shared-components.module';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-analyze-settings-total-results',
    templateUrl: './analyze-settings-total-results.component.html',
    styleUrls: ['./analyze-settings-total-results.component.scss'],
    standalone: true,
    imports: [
        MatIconModule,
        MatRippleModule,
        SharedComponentsModule,
    ],
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
