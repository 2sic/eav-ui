import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ICellRendererParams } from '@ag-grid-community/core';
import { ICellRendererAngularComp } from '@ag-grid-community/angular';

@Component({
  selector: 'app-features-list-ui',
  templateUrl: './features-list-ui.component.html',
  styleUrls: ['./features-list-ui.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
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
