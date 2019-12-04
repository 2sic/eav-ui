import { Component } from '@angular/core';
import { ICellRendererParams } from '@ag-grid-community/core';
import { ICellRendererAngularComp } from '@ag-grid-community/angular';

import { Feature } from '../../models/feature.model';

@Component({
  selector: 'app-features-list-ui',
  templateUrl: './features-list-ui.component.html',
  styleUrls: ['./features-list-ui.component.scss']
})
export class FeaturesListUiComponent implements ICellRendererAngularComp {
  params: ICellRendererParams;
  feature: Feature;

  agInit(params: ICellRendererParams) {
    this.params = params;
    this.feature = params.data;
  }

  refresh(params?: any): boolean {
    return true;
  }

}
