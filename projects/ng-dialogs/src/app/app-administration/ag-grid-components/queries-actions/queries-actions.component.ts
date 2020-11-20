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
  public query: Query;
  public params: QueriesActionsParams;

  constructor() { }

  agInit(params: QueriesActionsParams) {
    this.params = params;
    this.query = this.params.data;
    this.enablePermissions = this.params.enablePermissionsGetter();
  }

  refresh(params?: any): boolean {
    return true;
  }

  // editQuery() {
  //   this.params.onEditQuery(this.query);
  // }

  // openRestApi() {
  //   this.params.onOpenRestApi(this.query);
  // }

  // openPermissions() {
  //   this.params.onOpenPermissions(this.query);
  // }

  // cloneQuery() {
  //   this.params.onCloneQuery(this.query);
  // }

  // exportQuery() {
  //   this.params.onExportQuery(this.query);
  // }

  // deleteQuery() {
  //   this.params.onDelete(this.query);
  // }
}
