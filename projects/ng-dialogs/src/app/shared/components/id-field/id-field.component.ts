import { Component } from '@angular/core';
import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/all-modules';
import { MatSnackBar } from '@angular/material/snack-bar';

import { copyToClipboard } from '../../helpers/copyToClipboard';

@Component({
  selector: 'app-id-field',
  templateUrl: './id-field.component.html',
  styleUrls: ['./id-field.component.scss']
})
export class IdFieldComponent implements ICellRendererAngularComp {
  private params: ICellRendererParams;
  tooltip: string;
  id: number;

  constructor(private snackBar: MatSnackBar) { }

  agInit(params: ICellRendererParams) {
    this.params = params;
    this.tooltip = this.params.value;
    if (this.params.data.Id !== undefined && this.params.data.Id !== null) {
      this.id = this.params.data.Id;
    } else if (this.params.data.id !== undefined && this.params.data.id !== null) {
      this.id = this.params.data.id;
    }
  }

  refresh(params?: any): boolean {
    return true;
  }

  copy() {
    copyToClipboard(this.tooltip);
    this.snackBar.open('Copied to clipboard', null, { duration: 2000 });
  }
}
