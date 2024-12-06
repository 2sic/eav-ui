import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';
import { Component } from '@angular/core';
import { MatRippleModule } from '@angular/material/core';
import { transient } from '../../../../../../../core/transient';
import { TippyDirective } from '../../../../shared/directives/tippy.directive';
import { ClipboardService } from '../../../../shared/services/clipboard.service';

@Component({
    selector: 'app-analyze-settings-key',
    templateUrl: './analyze-settings-key.component.html',
    styleUrls: ['./analyze-settings-key.component.scss'],
    imports: [
        MatRippleModule,
        TippyDirective,
    ]
})
export class AnalyzeSettingsKeyComponent implements ICellRendererAngularComp {
  key: string;

  constructor() { }

  protected clipboard = transient(ClipboardService);

  agInit(params: ICellRendererParams) {
    this.key = params.value;
  }

  refresh(params?: any): boolean {
    return true;
  }
}
