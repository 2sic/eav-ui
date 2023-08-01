import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';
import { Component } from '@angular/core';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { GeneralHelpers } from '../../../../edit/shared/helpers';
import { copyToClipboard } from '../../../../shared/helpers/copy-to-clipboard.helper';

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

  copy(text: string) {
    text = GeneralHelpers.tryParse(text) ?? text;
    copyToClipboard(text);
    this.snackBar.open('Copied to clipboard', null, { duration: 2000 });
  }
}
