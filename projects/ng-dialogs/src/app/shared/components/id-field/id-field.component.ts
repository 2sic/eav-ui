import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { copyToClipboard } from '../../helpers/copy-to-clipboard.helper';
import { IdFieldParams } from './id-field.models';

@Component({
  selector: 'app-id-field',
  templateUrl: './id-field.component.html',
  styleUrls: ['./id-field.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IdFieldComponent implements ICellRendererAngularComp {
  id: number | string;
  tooltip: string;

  constructor(private snackBar: MatSnackBar) { }

  agInit(params: IdFieldParams) {
    this.id = params.value;
    this.tooltip = params.tooltipGetter(params.data);
  }

  refresh(params?: any): boolean {
    return true;
  }

  copy() {
    copyToClipboard(this.tooltip);
    this.snackBar.open('Copied to clipboard', null, { duration: 2000 });
  }
}
