import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ICellRendererParams } from '@ag-grid-community/core';
import { ICellRendererAngularComp } from '@ag-grid-community/angular';

@Component({
  selector: 'app-apps-list-show',
  templateUrl: './apps-list-show.component.html',
  styleUrls: ['./apps-list-show.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppsListShowComponent implements ICellRendererAngularComp {
  value: boolean;

  agInit(params: ICellRendererParams) {
    this.value = params.value;
  }

  refresh(params?: any): boolean {
    return true;
  }
}
