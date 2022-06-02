import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';
import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { copyToClipboard } from '../../helpers/copy-to-clipboard.helper';
import { IdFieldParams } from './id-field.models';

@Component({
  selector: 'app-id-field',
  templateUrl: './id-field.component.html',
  styleUrls: ['./id-field.component.scss'],
})
export class IdFieldComponent implements ICellRendererAngularComp {
  id: number | string;
  align: 'start' | 'end';
  tooltip: string;

  constructor(private snackBar: MatSnackBar) { }

  agInit(params: ICellRendererParams & IdFieldParams): void {
    this.id = params.value;
    this.align = typeof this.id === 'number' ? 'end' : 'start';
    this.tooltip = params.tooltipGetter(params.data);
  }

  refresh(params?: any): boolean {
    return true;
  }

  copy(): void {
    copyToClipboard(this.tooltip);
    this.snackBar.open('Copied to clipboard', null, { duration: 2000 });
  }
}
