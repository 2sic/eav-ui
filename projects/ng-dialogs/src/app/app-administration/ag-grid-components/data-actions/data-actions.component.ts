import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { Component } from '@angular/core';
import { guidRegex } from '../../../shared/constants/guid.constants';
import { ContentType } from '../../models/content-type.model';
import { DataActionsParams } from './data-actions.models';
import { EditInfo } from '../../../shared/models/edit-info';

@Component({
  selector: 'app-data-actions',
  templateUrl: './data-actions.component.html',
  styleUrls: ['./data-actions.component.scss'],
})
export class DataActionsComponent implements ICellRendererAngularComp {
  contentType: ContentType;
  editInfo: EditInfo;
  enablePermissions: boolean;
  private params: DataActionsParams;

  constructor() { }

  agInit(params: DataActionsParams) {
    this.params = params;
    this.contentType = this.params.data;
    this.editInfo = this.contentType.EditInfo;
    const enablePermissions = this.params.enablePermissionsGetter();
    this.enablePermissions = enablePermissions && guidRegex().test(this.contentType.StaticName);
  }

  refresh(params?: any): boolean {
    return true;
  }

  createOrEditMetadata() {
    this.params.onCreateOrEditMetadata(this.contentType);
  }

  openPermissions() {
    this.params.onOpenPermissions(this.contentType);
  }

  editContentType() {
    this.params.onEdit(this.contentType);
  }

  openMetadata() {
    this.params.onOpenMetadata(this.contentType);
  }

  openRestApi() {
    this.params.onOpenRestApi(this.contentType);
  }

  exportType() {
    this.params.onTypeExport(this.contentType);
  }

  openDataExport() {
    this.params.onOpenDataExport(this.contentType);
  }

  openDataImport() {
    this.params.onOpenDataImport(this.contentType);
  }

  deleteContentType() {
    this.params.onDelete(this.contentType);
  }
}
