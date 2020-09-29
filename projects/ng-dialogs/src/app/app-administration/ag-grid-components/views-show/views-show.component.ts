import { ICellRendererParams } from '@ag-grid-community/all-modules';
import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-views-show',
  templateUrl: './views-show.component.html',
  styleUrls: ['./views-show.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewsShowComponent implements ICellRendererAngularComp {
  value: boolean;

  agInit(params: ICellRendererParams) {
    this.value = params.value;
  }

  refresh(params?: any): boolean {
    return true;
  }
}
