import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';
import { Component } from '@angular/core';
import { IdFieldParams } from '../../../shared/components/id-field/id-field.models';

@Component({
  selector: 'app-app-name-show',
  templateUrl: './app-name-show.component.html',
  styleUrls: ['./app-name-show.component.scss'],
})
export class AppNameShowComponent implements ICellRendererAngularComp {
  name: string;
  tooltip: string;

  agInit(params: ICellRendererParams & IdFieldParams): void {
    this.name = params.value;
    this.tooltip = params.tooltipGetter(params.data);
  }

  refresh(params?: any): boolean {
    return true;
  }
}
