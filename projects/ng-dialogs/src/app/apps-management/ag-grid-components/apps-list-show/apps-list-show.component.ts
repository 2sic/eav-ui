import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';
import { ChangeDetectionStrategy, Component } from '@angular/core';

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
