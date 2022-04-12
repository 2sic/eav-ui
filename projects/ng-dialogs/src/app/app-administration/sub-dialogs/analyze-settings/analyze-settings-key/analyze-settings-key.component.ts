import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';
import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { copyToClipboard } from '../../../../shared/helpers/copy-to-clipboard.helper';

@Component({
  selector: 'app-analyze-settings-key',
  templateUrl: './analyze-settings-key.component.html',
  styleUrls: ['./analyze-settings-key.component.scss'],
})
export class AnalyzeSettingsKeyComponent implements ICellRendererAngularComp {
  key: string;

  constructor(private snackBar: MatSnackBar) { }

  agInit(params: ICellRendererParams) {
    this.key = params.value;
  }

  refresh(params?: any): boolean {
    return true;
  }

  copy() {
    copyToClipboard(this.key);
    this.snackBar.open('Copied to clipboard', null, { duration: 2000 });
  }
}
