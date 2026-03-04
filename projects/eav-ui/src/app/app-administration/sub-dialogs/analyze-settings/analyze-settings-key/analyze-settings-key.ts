import { Component } from '@angular/core';
import { MatRippleModule } from '@angular/material/core';
import { AgGridActionsBaseComponent } from '../../../../shared/ag-grid/ag-grid-actions-base';
import { TippyDirective } from '../../../../shared/directives/tippy.directive';

type AnalyzeSettingsRow = {
  Path: string;
};

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
  extends AgGridActionsBaseComponent<AnalyzeSettingsRow, 'copy'> {

  get key(): string {
    return this.params?.value
  }
}