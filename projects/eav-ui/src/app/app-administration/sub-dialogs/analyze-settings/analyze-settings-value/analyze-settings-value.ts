import { Component } from '@angular/core';
import { MatRippleModule } from '@angular/material/core';
import { AgGridActionsBaseComponent } from '../../../../shared/ag-grid/ag-grid-actions-base';
import { TippyDirective } from '../../../../shared/directives/tippy.directive';

type AnalyzeSettingsRow = {
  _value: string;
};

@Component({
  selector: 'app-analyze-settings-value',
  templateUrl: './analyze-settings-value.html',
  styleUrls: ['./analyze-settings-value.scss'],
  imports: [MatRippleModule, TippyDirective],
})
export class AnalyzeSettingsValueComponent
  extends AgGridActionsBaseComponent<AnalyzeSettingsRow, 'copy'> {

  get value(): string { return this.data?._value; }
}