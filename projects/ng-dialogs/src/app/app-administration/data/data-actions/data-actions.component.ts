import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';
import { Component } from '@angular/core';
import { guidRegex } from '../../../shared/constants/guid.constants';
import { ContentType } from '../../models/content-type.model';
import { DataActionsParams } from './data-actions.models';

@Component({
  selector: 'app-data-actions',
  templateUrl: './data-actions.component.html',
  styleUrls: ['./data-actions.component.scss'],
})
export class DataActionsComponent implements ICellRendererAngularComp {
  contentType: ContentType;
  enablePermissions: boolean;
  private params: ICellRendererParams & DataActionsParams;

  agInit(params: ICellRendererParams & DataActionsParams): void {
    this.params = params;
    this.contentType = this.params.data;
    const enablePermissions = this.params.enablePermissionsGetter();
    this.enablePermissions = enablePermissions && guidRegex().test(this.contentType.StaticName);
  }

  refresh(params?: any): boolean {
    return true;
  }

  createOrEditMetadata(): void {
    this.params.onCreateOrEditMetadata(this.contentType);
  }

  openPermissions(): void {
    this.params.onOpenPermissions(this.contentType);
  }

  editContentType(): void {
    this.params.onEdit(this.contentType);
  }

  openMetadata(): void {
    this.params.onOpenMetadata(this.contentType);
  }

  openRestApi(): void {
    this.params.onOpenRestApi(this.contentType);
  }

  exportType(): void {
    this.params.onTypeExport(this.contentType);
  }

  openDataExport(): void {
    this.params.onOpenDataExport(this.contentType);
  }

  openDataImport(): void {
    this.params.onOpenDataImport(this.contentType);
  }

  deleteContentType(): void {
    this.params.onDelete(this.contentType);
  }
}
