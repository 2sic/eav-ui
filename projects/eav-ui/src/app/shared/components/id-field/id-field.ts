import { NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AgGridCellRendererBaseComponent } from '../../ag-grid/ag-grid-cell-renderer-base';
import { TippyDirective } from '../../directives/tippy.directive';
import { copyToClipboard } from '../../helpers/copy-to-clipboard.helper';
import { IdFieldParams } from './id-field.models';

@Component({
  selector: 'app-id-field',
  templateUrl: './id-field.html',
  styleUrls: ['./id-field.scss'],
  imports: [
    NgClass,
    MatIconModule,
    TippyDirective,
  ]
})
export class IdFieldComponent
  extends AgGridCellRendererBaseComponent<unknown, number | string, IdFieldParams> {

  constructor(private snackBar: MatSnackBar) { super(); }

  get id(): number | string { return this.value; }

  get align(): 'start' | 'end' { return typeof this.id === 'number' ? 'end' : 'start'; }
  
  get tooltip(): string { return this.params.tooltipGetter(this.data); }

  copy(): void {
    copyToClipboard(this.tooltip);
    this.snackBar.open('Copied to clipboard', undefined, { duration: 2000 });
  }

}