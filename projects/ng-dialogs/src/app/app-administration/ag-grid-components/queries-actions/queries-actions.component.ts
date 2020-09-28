import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Query } from '../../models/query.model';
import { QueriesActionsParams } from './queries-actions.models';

@Component({
  selector: 'app-queries-actions',
  templateUrl: './queries-actions.component.html',
  styleUrls: ['./queries-actions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QueriesActionsComponent implements ICellRendererAngularComp {
  enablePermissions: boolean;
  private params: QueriesActionsParams;

  constructor() { }

  agInit(params: QueriesActionsParams) {
    this.params = params;
    this.enablePermissions = this.params.enablePermissionsGetter();
  }

  refresh(params?: any): boolean {
    return true;
  }

  editQuery() {
    const query: Query = this.params.data;
    this.params.onEditQuery(query);
  }

  openPermissions() {
    const query: Query = this.params.data;
    this.params.onOpenPermissions(query);
  }

  cloneQuery() {
    const query: Query = this.params.data;
    this.params.onCloneQuery(query);
  }

  exportQuery() {
    const query: Query = this.params.data;
    this.params.onExportQuery(query);
  }

  deleteQuery() {
    const query: Query = this.params.data;
    this.params.onDelete(query);
  }
}
