import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { View } from '../../models/view.model';
import { ViewActionsParams } from './views-actions.models';

@Component({
  selector: 'app-views-actions',
  templateUrl: './views-actions.component.html',
  styleUrls: ['./views-actions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewsActionsComponent implements ICellRendererAngularComp {
  enableCode: boolean;
  enablePermissions: boolean;
  private params: ViewActionsParams;

  agInit(params: ViewActionsParams) {
    this.params = params;
    this.enableCode = this.params.enableCodeGetter();
    this.enablePermissions = this.params.enablePermissionsGetter();
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
