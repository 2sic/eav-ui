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
  enableAppFeatures = true; // spm figure out what this is
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

  openExport() {
    this.params.onOpenExport(this.contentType);
  }

  openImport() {
    this.params.onOpenImport(this.contentType);
  }

  openPermissions() {
    this.params.onOpenPermissions(this.contentType);
  }

  deleteContentType() {
    this.params.onDelete(this.contentType);
  }

  isGuid(txtToTest: string) {
    const patt = new RegExp(/[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}/i);
    return patt.test(txtToTest); // note: can't use the txtToTest.match because it causes infinite digest cycles
  }
}
