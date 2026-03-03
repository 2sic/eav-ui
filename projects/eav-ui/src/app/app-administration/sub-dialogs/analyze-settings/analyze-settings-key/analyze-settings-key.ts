import { Component } from '@angular/core';
import { MatRippleModule } from '@angular/material/core';
import { AgGridActionsBaseComponent } from '../../../../shared/ag-grid/ag-grid-actions-base';
import { TippyDirective } from '../../../../shared/directives/tippy.directive';

type AnalyzeSettingsRow = {
  Key: string;
};

export type AnalyzeSettingsVerb = 'copy';

@Component({
  selector: 'app-analyze-settings-key',
  templateUrl: './analyze-settings-key.html',
  styleUrls: ['./analyze-settings-key.scss'],
  imports: [
    MatRippleModule,
    TippyDirective,
  ],
})
export class AnalyzeSettingsKeyComponent
  extends AgGridActionsBaseComponent<AnalyzeSettingsRow, AnalyzeSettingsVerb> {

  get key(): string {
    return this.data?.Key ?? '';
  }
}