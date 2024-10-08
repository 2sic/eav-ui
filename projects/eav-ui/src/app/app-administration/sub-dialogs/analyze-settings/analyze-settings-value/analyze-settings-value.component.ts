import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';
import { Component } from '@angular/core';
import { MatRippleModule } from '@angular/material/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { transient } from 'projects/core';
import { TippyDirective } from '../../../../shared/directives/tippy.directive';
import { JsonHelpers } from '../../../../shared/helpers/json.helpers';
import { ClipboardService } from '../../../../shared/services/clipboard.service';

@Component({
  selector: 'app-analyze-settings-value',
  templateUrl: './analyze-settings-value.component.html',
  styleUrls: ['./analyze-settings-value.component.scss'],
  standalone: true,
  imports: [MatRippleModule, TippyDirective,],
})
export class AnalyzeSettingsValueComponent implements ICellRendererAngularComp {
  value: string;

  constructor(private snackBar: MatSnackBar) { }

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
