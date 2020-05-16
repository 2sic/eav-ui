import { Component } from '@angular/core';
import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/all-modules';
import { MatSnackBar } from '@angular/material/snack-bar';

import { copyToClipboard } from '../../../shared/helpers/copy-to-clipboard.helper';

@Component({
  selector: 'app-views-usage-id',
  templateUrl: './views-usage-id.component.html',
  styleUrls: ['./views-usage-id.component.scss']
})
export class ViewsUsageIdComponent implements ICellRendererAngularComp {
  tooltip: string;
  id: string;

  constructor(private snackBar: MatSnackBar) { }

  agInit(params: ICellRendererParams) {
    this.tooltip = params.value;
    if (this.tooltip == null) { return; }
    const isMultiline = this.tooltip.indexOf('\n') !== -1;
    this.id = this.tooltip.substring(this.tooltip.indexOf(' ') + 1, isMultiline ? this.tooltip.indexOf('\n') : undefined);
  }

  refresh(params?: any): boolean {
    return true;
  }

  copy() {
    copyToClipboard(this.tooltip);
    this.snackBar.open('Copied to clipboard', null, { duration: 2000 });
  }
}
