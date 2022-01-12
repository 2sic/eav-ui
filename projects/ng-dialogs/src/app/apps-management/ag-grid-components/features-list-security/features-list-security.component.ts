import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';
import { Component } from '@angular/core';
import { Feature } from '../../models/feature.model';

@Component({
  selector: 'app-features-list-security',
  templateUrl: './features-list-security.component.html',
  styleUrls: ['./features-list-security.component.scss'],
})
export class FeaturesListSecurityComponent implements ICellRendererAngularComp {
  value: number;
  feature: Feature;

  agInit(params: ICellRendererParams) {
    this.value = params.value;
    this.feature = params.data;
  }

  refresh(params?: any): boolean {
    return true;
  }
}
