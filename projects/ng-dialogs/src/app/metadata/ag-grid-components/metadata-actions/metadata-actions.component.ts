import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { Component } from '@angular/core';
import { Metadata } from '../../models/metadata.model';
import { MetadataActionsParams } from './metadata-actions.models';

@Component({
  selector: 'app-metadata-actions',
  templateUrl: './metadata-actions.component.html',
  styleUrls: ['./metadata-actions.component.scss'],
})
export class MetadataActionsComponent implements ICellRendererAngularComp {
  private params: MetadataActionsParams;

  agInit(params: MetadataActionsParams) {
    this.params = params;
  }

  refresh(params?: any): boolean {
    return true;
  }

  deleteMetadata() {
    const metadata: Metadata = this.params.data;
    this.params.onDelete(metadata);
  }
}
