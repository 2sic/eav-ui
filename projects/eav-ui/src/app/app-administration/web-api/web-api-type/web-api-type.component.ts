import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';
import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { SharedComponentsModule } from '../../../shared/shared-components.module';

@Component({
    selector: 'app-web-api-type',
    templateUrl: './web-api-type.component.html',
    styleUrls: ['./web-api-type.component.scss'],
    standalone: true,
    imports: [SharedComponentsModule, MatIconModule],
})
export class WebApiTypeComponent implements ICellRendererAngularComp {
  value: boolean;

  agInit(params: ICellRendererParams) {
    this.value = params.value;
  }

  refresh(params?: any): boolean {
    return true;
  }
}
