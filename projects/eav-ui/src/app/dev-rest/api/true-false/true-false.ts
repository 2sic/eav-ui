import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { AgGridCellRendererBaseComponent } from '../../../shared/ag-grid/ag-grid-cell-renderer-base';

@Component({
  selector: 'app-rest-api-true-false',
  templateUrl: './true-false.html',
  imports: [MatIconModule]
})
export class TrueFalseComponent
  extends AgGridCellRendererBaseComponent<unknown, boolean, TrueFalseParams> {

  get trueIcon(): string { return this.params.trueIcon ?? 'check_circle'; }
  get falseIcon(): string { return this.params.falseIcon ?? 'circle'; }
  get normalizedValue(): boolean { return this.params.reverse ? !this.value : this.value; }
  get icon(): string { return this.normalizedValue ? this.trueIcon : this.falseIcon; }

}

export interface TrueFalseParams {
  reverse?: boolean;
  trueIcon?: string;
  falseIcon?: string;
}