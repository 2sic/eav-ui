import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';
import { Component } from '@angular/core';
import { CheckboxCellParams } from './checkbox-cell.model';

@Component({
  selector: 'app-checkbox-cell',
  templateUrl: './checkbox-cell.component.html',
  styleUrls: ['./checkbox-cell.component.scss'],
})
export class CheckboxCellComponent implements ICellRendererAngularComp {
  params: ICellRendererParams & CheckboxCellParams;

  agInit(params: ICellRendererParams & CheckboxCellParams): void {
    this.params = params;
  }

  refresh(params?: any): boolean {
    return true;
  }

  public onChange(event: any) {
    this.params.onChange(this.params.data, event.currentTarget.checked);
  }
}
