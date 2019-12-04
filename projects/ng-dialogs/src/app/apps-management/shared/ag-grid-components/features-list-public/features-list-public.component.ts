import { Component } from '@angular/core';
import { ICellRendererParams } from '@ag-grid-community/core';
import { ICellRendererAngularComp } from '@ag-grid-community/angular';

import { Feature } from '../../models/feature.model';

@Component({
  selector: 'app-features-list-public',
  templateUrl: './features-list-public.component.html',
  styleUrls: ['./features-list-public.component.scss']
})
export class FeaturesListPublicComponent implements ICellRendererAngularComp {
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
