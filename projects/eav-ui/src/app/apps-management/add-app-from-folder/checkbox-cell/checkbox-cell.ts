import { Component } from '@angular/core';
import { AgGridCellRendererBaseComponent } from '../../../shared/ag-grid/ag-grid-cell-renderer-base';
import { PendingApp } from '../../models/app.model';
import { CheckboxCellParams } from './checkbox-cell.model';

@Component({
  selector: 'app-checkbox-cell',
  templateUrl: './checkbox-cell.html',
  styleUrls: ['./checkbox-cell.scss'],
})
export class CheckboxCellComponent
  extends AgGridCellRendererBaseComponent<PendingApp, boolean, CheckboxCellParams> {

  onChange(event: Event): void {
    const input = event.currentTarget as HTMLInputElement;
    this.params.onChange(this.data, input.checked);
  }
}