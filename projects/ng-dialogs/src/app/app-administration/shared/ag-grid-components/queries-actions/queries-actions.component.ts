import { Component } from '@angular/core';
import { ICellRendererAngularComp } from '@ag-grid-community/angular';

import { Query } from '../../models/query.model';
import { PipelinesActionsParams } from '../../models/pipeline-actions-params';

@Component({
  selector: 'app-queries-actions',
  templateUrl: './queries-actions.component.html',
  styleUrls: ['./queries-actions.component.scss']
})
export class QueriesActionsComponent implements ICellRendererAngularComp {
  private params: PipelinesActionsParams;

  agInit(params: PipelinesActionsParams) {
    this.params = params;
  }

  refresh(params?: any): boolean {
    return true;
  }

  editQuery() {
    const query: Query = this.params.data;
    this.params.onEditQuery(query);
  }

  cloneQuery() {
    const query: Query = this.params.data;
    this.params.onCloneQuery(query);
  }

  exportQuery() {
    const query: Query = this.params.data;
    this.params.onExportQuery(query);
  }

  openPermissions() {
    const query: Query = this.params.data;
    this.params.onOpenPermissions(query);
  }

  deleteQuery() {
    const query: Query = this.params.data;
    this.params.onDelete(query);
  }
}
