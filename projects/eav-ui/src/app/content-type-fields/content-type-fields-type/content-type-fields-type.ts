import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';
import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { TippyDirective } from '../../shared/directives/tippy.directive';
import { calculateTypeIcon } from '../content-type-fields.helpers';

@Component({
    selector: 'app-content-type-fields-type',
    templateUrl: './content-type-fields-type.html',
    imports: [
        MatIconModule,
        TippyDirective,
    ]
})
export class ContentTypeFieldsTypeComponent implements ICellRendererAngularComp {
  value: string;
  icon: string;

  agInit(params: ICellRendererParams) {
    this.value = params.value;
    this.icon = calculateTypeIcon(this.value);
  }

  refresh(params?: any): boolean {
    return true;
  }
}
