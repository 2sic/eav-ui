import { Component } from '@angular/core';
import { MatRippleModule } from '@angular/material/core';
import { transient } from '../../../../../../../core/transient';
import { AgGridActionsBaseComponent } from '../../../../shared/ag-grid/ag-grid-actions-base';
import { TippyDirective } from '../../../../shared/directives/tippy.directive';
import { JsonHelpers } from '../../../../shared/helpers/json.helpers';
import { ClipboardService } from '../../../../shared/services/clipboard.service';

type AnalyzeSettingsRow = {
  _value: string;
};

@Component({
  selector: 'app-analyze-settings-value',
  templateUrl: './analyze-settings-value.html',
  styleUrls: ['./analyze-settings-value.scss'],
  imports: [
    MatRippleModule,
    TippyDirective,
  ],
})
export class AnalyzeSettingsValueComponent extends AgGridActionsBaseComponent<AnalyzeSettingsRow, 'noop'> {

  protected clipboard = transient(ClipboardService);

  get value(): string {
    return this.data?._value ?? '';
  }

  copy(): void {
    const parsed = JsonHelpers.tryParse(this.value) ?? this.value;
    this.clipboard.copyToClipboard(parsed);
  }
}