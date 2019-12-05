import { Component } from '@angular/core';
import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/all-modules';

import { Query } from '../../models/query.model';

@Component({
  selector: 'app-queries-description',
  templateUrl: './queries-description.component.html',
  styleUrls: ['./queries-description.component.scss']
})
export class QueriesDescriptionComponent implements ICellRendererAngularComp {
  params: ICellRendererParams;
  query: Query;

  agInit(params: ICellRendererParams) {
    this.params = params;
    this.query = params.data;
  }

  refresh(params?: any): boolean {
    return true;
  }

  editQuery(event: MouseEvent) {
    event.stopPropagation();
    alert('Edit query!');
    // this.params.onOpenFields(this.app);
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
    alert('Delete query!');
    // this.params.onOpenFields(this.app);
  }
}
