import { Component } from '@angular/core';
import { ICellRendererAngularComp } from '@ag-grid-community/angular';

import { ContentType } from '../../models/content-type.model';
import { DataActionsParams } from '../../models/data-actions-params';

@Component({
  selector: 'app-data-actions',
  templateUrl: './data-actions.component.html',
  styleUrls: ['./data-actions.component.scss']
})
export class DataActionsComponent implements ICellRendererAngularComp {
  params: DataActionsParams;
  contentType: ContentType;

  agInit(params: DataActionsParams) {
    this.params = params;
    this.contentType = params.data;
  }

  refresh(params?: any): boolean {
    return true;
  }

  editContentType() {
    this.params.onEdit(this.contentType);
  }

  createOrEditMetadata() {
    this.params.onCreateOrEditMetadata(this.contentType);
  }

  exportContent() {
    alert('Export content!');
    // this.params.onOpenFields(this.app);
  }

  importContent() {
    alert('Import content!');
    // this.params.onOpenFields(this.app);
  }

  openPermissions() {
    alert('Open permissions!');
    // this.params.onOpenFields(this.app);
  }

  deleteContentType() {
    this.params.onDelete(this.contentType);
  }
}
