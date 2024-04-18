import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';
import { Component } from '@angular/core';
import { WebApi } from '../../models/web-api.model';
import { WebApiActionsParams } from './web-api-actions.models';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { SharedComponentsModule } from '../../../shared/shared-components.module';
import { MatRippleModule } from '@angular/material/core';

@Component({
    selector: 'app-web-api-actions',
    templateUrl: './web-api-actions.component.html',
    styleUrls: ['./web-api-actions.component.scss'],
    standalone: true,
    imports: [
        MatRippleModule,
        SharedComponentsModule,
        MatIconModule,
        MatMenuModule,
    ],
})
export class WebApiActionsComponent implements ICellRendererAngularComp {
  enableCode: boolean;
  private params: ICellRendererParams & WebApiActionsParams;

  agInit(params: ICellRendererParams & WebApiActionsParams): void {
    this.params = params;
    this.enableCode = this.params.enableCodeGetter();
  }

  refresh(params?: any): boolean {
    return true;
  }

  openCode(): void {
    const api: WebApi = this.params.data;
    this.params.onOpenCode(api);
  }

  openRestApi(): void {
    const api: WebApi = this.params.data;
    this.params.onOpenRestApi(api);
  }
}
