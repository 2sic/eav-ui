import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ICellRendererParams } from '@ag-grid-community/core';
import { ICellRendererAngularComp } from '@ag-grid-community/angular';

@Component({
  selector: 'app-features-list-enabled',
  templateUrl: './features-list-enabled.component.html',
  styleUrls: ['./features-list-enabled.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FeaturesListEnabledComponent implements ICellRendererAngularComp {
  value: boolean;

  agInit(params: ICellRendererParams) {
    this.value = params.value;
  }

  refresh(params?: any): boolean {
    return true;
  }
}
