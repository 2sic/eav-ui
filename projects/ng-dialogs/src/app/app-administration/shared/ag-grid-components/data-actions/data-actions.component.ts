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
  enableAppFeatures = true; // spm TODO: this is fa from url (or session storage). Does it have to change for sub dialogs?
  params: DataActionsParams;
  contentType: ContentType;
  showPermissions: boolean;

  agInit(params: DataActionsParams) {
    this.params = params;
    this.contentType = params.data;
    this.showPermissions = this.enableAppFeatures && this.isGuid(this.contentType.StaticName);
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

  private isGuid(txtToTest: string) {
    const patt = new RegExp(/[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}/i);
    return patt.test(txtToTest); // note: can't use the txtToTest.match because it causes infinite digest cycles
  }
}
