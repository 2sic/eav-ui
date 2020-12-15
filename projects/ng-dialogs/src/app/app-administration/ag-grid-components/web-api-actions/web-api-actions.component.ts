import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { WebApi } from '../../models/web-api.model';
import { WebApiActionsParams } from './web-api-actions.models';

@Component({
  selector: 'app-web-api-actions',
  templateUrl: './web-api-actions.component.html',
  styleUrls: ['./web-api-actions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WebApiActionsComponent implements ICellRendererAngularComp {
  enableCode: boolean;
  private params: WebApiActionsParams;

  agInit(params: WebApiActionsParams) {
    this.params = params;
    this.enableCode = this.params.enableCodeGetter();
  }

  refresh(params?: any): boolean {
    return true;
  }

  openCode() {
    const api: WebApi = this.params.data;
    this.params.onOpenCode(api);
  }

  openRestApi() {
    const api: WebApi = this.params.data;
    this.params.onOpenRestApi(api);
  }
}
