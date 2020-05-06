import { Component } from '@angular/core';
import { ICellRendererAngularComp } from '@ag-grid-community/angular';

import { WebApiActionsParams } from '../../models/web-api-actions-params';
import { WebApi } from '../../models/web-api.model';

@Component({
  selector: 'app-web-api-actions',
  templateUrl: './web-api-actions.component.html',
  styleUrls: ['./web-api-actions.component.scss']
})
export class WebApiActionsComponent implements ICellRendererAngularComp {
  private params: WebApiActionsParams;

  agInit(params: WebApiActionsParams) {
    this.params = params;
  }

  refresh(params?: any): boolean {
    return true;
  }

  openCode() {
    const api: WebApi = this.params.data;
    this.params.onOpenCode(api);
  }

  deleteApi() {
    const api: WebApi = this.params.data;
    this.params.onDelete(api);
  }
}
