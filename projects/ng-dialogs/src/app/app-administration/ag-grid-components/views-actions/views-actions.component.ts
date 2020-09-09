import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ICellRendererAngularComp } from '@ag-grid-community/angular';

import { View } from '../../models/view.model';
import { ViewActionsParams } from './views-actions.models';

@Component({
  selector: 'app-views-actions',
  templateUrl: './views-actions.component.html',
  styleUrls: ['./views-actions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewsActionsComponent implements ICellRendererAngularComp {
  showCode: boolean;
  showPermissions: boolean;
  private params: ViewActionsParams;

  agInit(params: ViewActionsParams) {
    this.params = params;
    this.showCode = this.params.showCodeGetter();
    this.showPermissions = this.params.showPermissionsGetter();
  }

  refresh(params?: any): boolean {
    return true;
  }

  openCode() {
    const view: View = this.params.data;
    this.params.onOpenCode(view);
  }

  openPermissions() {
    const view: View = this.params.data;
    this.params.onOpenPermissions(view);
  }

  deleteView() {
    const view: View = this.params.data;
    this.params.onDelete(view);
  }
}
