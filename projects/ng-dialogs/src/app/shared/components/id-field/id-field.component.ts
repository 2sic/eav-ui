import { ICellRendererParams } from '@ag-grid-community/all-modules';
import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { copyToClipboard } from '../../helpers/copy-to-clipboard.helper';

@Component({
  selector: 'app-id-field',
  templateUrl: './id-field.component.html',
  styleUrls: ['./id-field.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IdFieldComponent implements ICellRendererAngularComp {
  tooltip: string;
  id: number;
  private params: ICellRendererParams;

  constructor(private snackBar: MatSnackBar) { }

  agInit(params: ICellRendererParams) {
    this.params = params;
    this.tooltip = this.params.value;
    const data: any = this.params.data;
    if (data.Id != null) {
      this.id = data.Id;
    } else if (data.id != null) {
      this.id = data.id;
    } else if (data.Code != null) {
      this.id = data.Code;
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
