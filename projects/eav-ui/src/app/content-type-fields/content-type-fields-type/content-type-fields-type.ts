import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { AgGridCellRendererBaseComponent } from '../../shared/ag-grid/ag-grid-cell-renderer-base';
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
export class ContentTypeFieldsTypeComponent
  extends AgGridCellRendererBaseComponent<unknown, string, unknown> {

  get icon(): string { return calculateTypeIcon(this.value); }
}