import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';
import { Component } from '@angular/core';
import { MatRippleModule } from '@angular/material/core';
import { transient } from '../../../../../../../core/transient';
import { TippyDirective } from '../../../../shared/directives/tippy.directive';
import { JsonHelpers } from '../../../../shared/helpers/json.helpers';
import { ClipboardService } from '../../../../shared/services/clipboard.service';

@Component({
    selector: 'app-analyze-settings-value',
    templateUrl: './analyze-settings-value.html',
    styleUrls: ['./analyze-settings-value.scss'],
    imports: [
        MatRippleModule,
        TippyDirective,
    ]
})
export class AnalyzeSettingsValueComponent implements ICellRendererAngularComp {
  value: string;

  constructor() { }

  protected clipboard = transient(ClipboardService);

  agInit(params: ICellRendererParams) {
    this.value = params.value;
  }

  refresh(params?: any): boolean {
    return true;
  }
  
  copy(value: string) {
    value = JsonHelpers.tryParse(value) ?? value;
    this.clipboard.copyToClipboard(value);
  }
}
