import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';
import { Component } from '@angular/core';
import { Feature } from '../../models/feature.model';

@Component({
  selector: 'app-features-list-name',
  templateUrl: './features-list-name.component.html',
  styleUrls: ['./features-list-name.component.scss'],
})
export class FeaturesListNameComponent implements ICellRendererAngularComp {
  value: string;
  feature: Feature;

  agInit(params: ICellRendererParams) {
    this.value = params.value;
    this.feature = params.data;
  }

  refresh(params?: any): boolean {
    return true;
  }
}
