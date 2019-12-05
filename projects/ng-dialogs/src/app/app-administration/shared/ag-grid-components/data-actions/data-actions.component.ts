import { Component } from '@angular/core';
import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/all-modules';

import { ContentType } from '../../models/content-type.model';

@Component({
  selector: 'app-data-actions',
  templateUrl: './data-actions.component.html',
  styleUrls: ['./data-actions.component.scss']
})
export class DataActionsComponent implements ICellRendererAngularComp {
  params: ICellRendererParams;
  contentType: ContentType;

  agInit(params: ICellRendererParams) {
    this.params = params;
    this.contentType = params.data;
  }

  refresh(params?: any): boolean {
    return true;
  }

  renameContentType() {
    alert('Rename content type!');
    // this.params.onOpenFields(this.app);
  }

  editMetadata() {
    alert('Edit metadata!');
    // this.params.onOpenFields(this.app);
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
    alert('Delete content type!');
    // this.params.onOpenFields(this.app);
  }
}
