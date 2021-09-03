import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';
import { Component } from '@angular/core';

@Component({
  selector: 'app-features-list-ui',
  templateUrl: './features-list-ui.component.html',
  styleUrls: ['./features-list-ui.component.scss'],
})
export class FeaturesListUiComponent implements ICellRendererAngularComp {
  value: boolean;

  agInit(params: ICellRendererParams) {
    this.value = params.value;
  }

  refresh(params?: any): boolean {
    return true;
  }
}
