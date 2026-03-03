import { Component } from '@angular/core';
import { MatRippleModule } from '@angular/material/core';
import { transient } from '../../../../../../../core/transient';
import { AgGridActionsBaseComponent } from '../../../../shared/ag-grid/ag-grid-actions-base';
import { TippyDirective } from '../../../../shared/directives/tippy.directive';
import { ClipboardService } from '../../../../shared/services/clipboard.service';

type AnalyzeSettingsRow = {
  Key: string;
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
export class AnalyzeSettingsKeyComponent extends AgGridActionsBaseComponent<AnalyzeSettingsRow, 'noop'> {

  protected clipboard = transient(ClipboardService);

  get key(): string {
    return this.data?.Key ?? '';
  }
}