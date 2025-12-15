import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';
import { NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
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
