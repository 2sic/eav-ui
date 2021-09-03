import { ICellRendererParams } from '@ag-grid-community/all-modules';
import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { copyToClipboard } from '../../../shared/helpers/copy-to-clipboard.helper';

@Component({
  selector: 'app-analyze-settings-value',
  templateUrl: './analyze-settings-value.component.html',
  styleUrls: ['./analyze-settings-value.component.scss'],
})
export class AnalyzeSettingsValueComponent implements ICellRendererAngularComp {
  value: string;

  constructor(private snackBar: MatSnackBar) { }

  agInit(params: ICellRendererParams) {
    this.value = params.value;
  }

  refresh(params?: any): boolean {
    return true;
  }

  copy() {
    copyToClipboard(this.value);
    this.snackBar.open('Copied to clipboard', null, { duration: 2000 });
  }
}
