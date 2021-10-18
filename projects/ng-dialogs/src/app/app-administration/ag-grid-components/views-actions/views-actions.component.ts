import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { Component } from '@angular/core';
import { View } from '../../models/view.model';
import { ViewActionsParams } from './views-actions.models';

@Component({
  selector: 'app-views-actions',
  templateUrl: './views-actions.component.html',
  styleUrls: ['./views-actions.component.scss'],
})
export class ViewsActionsComponent implements ICellRendererAngularComp {
  view: View;
  enableCode: boolean;
  enablePermissions: boolean;
  private params: ViewActionsParams;

  constructor() { }

  agInit(params: ViewActionsParams) {
    this.params = params;
    this.view = this.params.data;
    this.enableCode = this.params.enableCodeGetter();
    this.enablePermissions = this.params.enablePermissionsGetter();
  }

  refresh(params?: any): boolean {
    return true;
  }

  openCode() {
    this.params.onOpenCode(this.view);
  }

  openPermissions() {
    this.params.onOpenPermissions(this.view);
  }

  addMetadata() {
    this.params.onAddMetadata(this.view);
  }

  cloneView() {
    this.params.onClone(this.view);
  }

  exportView() {
    this.params.onExport(this.view);
  }

  deleteView() {
    this.params.onDelete(this.view);
  }
}
