import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';
import { Component } from '@angular/core';
import { View } from '../../models';
import { calculateViewType } from '../views.helpers';
import { MatIconModule } from '@angular/material/icon';
import { SharedComponentsModule } from '../../../shared/shared-components.module';

@Component({
    selector: 'app-views-type',
    templateUrl: './views-type.component.html',
    styleUrls: ['./views-type.component.scss'],
    standalone: true,
    imports: [SharedComponentsModule, MatIconModule],
})
export class ViewsTypeComponent implements ICellRendererAngularComp {
  value: string;
  icon: string;
  isShared: boolean;

  agInit(params: ICellRendererParams) {
    this.value = params.value;
    const view: View = params.data;
    const type = calculateViewType(view);
    this.icon = type.icon;
    this.isShared = view.IsShared;
  }

  refresh(params?: any): boolean {
    return true;
  }
}
