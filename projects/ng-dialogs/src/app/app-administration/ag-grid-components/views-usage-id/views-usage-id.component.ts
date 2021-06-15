import { ICellRendererParams } from '@ag-grid-community/all-modules';
import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { copyToClipboard } from '../../../shared/helpers/copy-to-clipboard.helper';

@Component({
  selector: 'app-views-usage-id',
  templateUrl: './views-usage-id.component.html',
  styleUrls: ['./views-usage-id.component.scss'],
})
export class ViewsUsageIdComponent implements ICellRendererAngularComp {
  tooltip: string;
  id: string;

  constructor(private snackBar: MatSnackBar) { }

  agInit(params: ICellRendererParams) {
    this.tooltip = params.value;
    if (this.tooltip == null) { return; }
    const idPart = this.tooltip.split('\n')[0];
    this.id = idPart.split(' ')[1];
  }

  refresh(params?: any): boolean {
    return true;
  }

  copy() {
    copyToClipboard(this.tooltip);
    this.snackBar.open('Copied to clipboard', null, { duration: 2000 });
  }
}
