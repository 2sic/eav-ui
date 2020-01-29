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
    this.params.onEditPipeline(this.query);
  }

  copyQuery(event: MouseEvent) {
    event.stopPropagation();
    alert('Copy query!');
    // this.params.onOpenFields(this.app);
  }

  exportQuery(event: MouseEvent) {
    event.stopPropagation();
    alert('Export query!');
    // this.params.onOpenFields(this.app);
  }

  openPermissions(event: MouseEvent) {
    event.stopPropagation();
    alert('Open permissions!');
    // this.params.onOpenFields(this.app);
  }

  deleteQuery(event: MouseEvent) {
    event.stopPropagation();
    this.params.onDelete(this.query);
  }
}
