import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { AgGridActionsBaseComponent } from '../../../shared/ag-grid/ag-grid-actions-base';
import { TippyDirective } from '../../../shared/directives/tippy.directive';
import { View } from '../../models';
import { calculateViewType } from '../views.helpers';

@Component({
  selector: 'app-views-type',
  templateUrl: './views-type.html',
  imports: [MatIconModule, TippyDirective],
})
export class ViewsTypeComponent extends AgGridActionsBaseComponent<View, never> {

  get type() { return this.data ? calculateViewType(this.data) : null; }

  get icon(): string { return this.type?.icon ?? ''; }

  get label(): string { return this.type?.value ?? ''; }

  get isShared(): boolean { return !!this.data?.IsShared; }
}