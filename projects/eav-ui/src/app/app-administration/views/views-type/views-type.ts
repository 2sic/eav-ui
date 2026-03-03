import { Component, computed } from '@angular/core';
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
export class ViewsTypeComponent extends AgGridActionsBaseComponent<View, 'noop'> {

  /** what ag-grid used to pass as `params.value` */
  protected readonly value = computed(() => this.params?.value as string);

  protected readonly type = computed(() => calculateViewType(this.data));

  protected readonly icon = computed(() => this.type().icon);

  protected readonly isShared = computed(() => !!this.data?.IsShared);
}