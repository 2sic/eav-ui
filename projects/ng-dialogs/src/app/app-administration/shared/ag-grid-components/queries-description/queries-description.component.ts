import { Component } from '@angular/core';
import { ICellRendererAngularComp } from '@ag-grid-community/angular';

import { Query } from '../../models/query.model';
import { PipelinesActionsParams } from '../../models/pipeline-actions-params';

@Component({
  selector: 'app-queries-description',
  templateUrl: './queries-description.component.html',
  styleUrls: ['./queries-description.component.scss']
})
export class QueriesDescriptionComponent implements ICellRendererAngularComp {
  params: PipelinesActionsParams;
  query: Query;

  agInit(params: PipelinesActionsParams) {
    this.params = params;
    this.query = params.data;
  }

  refresh(params?: any): boolean {
    return true;
  }

  editQuery(event: MouseEvent) {
    event.stopPropagation();
    this.params.onEditQuery(this.query);
  }

  cloneQuery(event: MouseEvent) {
    event.stopPropagation();
    this.params.onCloneQuery(this.query);
  }

  exportQuery(event: MouseEvent) {
    event.stopPropagation();
    this.params.onExportQuery(this.query);
  }

  openPermissions(event: MouseEvent) {
    event.stopPropagation();
    this.params.onOpenPermissions(this.query);
  }

  deleteQuery(event: MouseEvent) {
    event.stopPropagation();
    this.params.onDelete(this.query);
  }
}
