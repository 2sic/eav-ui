import { Component } from '@angular/core';
import { ICellRendererParams } from '@ag-grid-community/core';
import { ICellRendererAngularComp } from '@ag-grid-community/angular';

import { App } from '../../../../shared/models/app.model';

@Component({
  selector: 'app-apps-list-show',
  templateUrl: './apps-list-show.component.html',
  styleUrls: ['./apps-list-show.component.scss']
})
export class AppsListShowComponent implements ICellRendererAngularComp {
  params: ICellRendererParams;
  app: App;

  agInit(params: ICellRendererParams) {
    this.params = params;
    this.app = params.data;
  }

  refresh(params?: any): boolean {
    return true;
  }
}
