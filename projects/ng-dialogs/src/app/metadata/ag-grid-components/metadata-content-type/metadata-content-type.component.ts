import { ICellRendererParams } from '@ag-grid-community/all-modules';
import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { Component } from '@angular/core';
import { MetadataItem } from '../../models/metadata.model';

@Component({
  selector: 'app-metadata-content-type',
  templateUrl: './metadata-content-type.component.html',
  styleUrls: ['./metadata-content-type.component.scss'],
})
export class MetadataContentTypeComponent implements ICellRendererAngularComp {
  value: string;
  metadata: MetadataItem;

  agInit(params: ICellRendererParams) {
    this.value = params.value;
    this.metadata = params.data;
  }

  refresh(params?: any): boolean {
    return true;
  }
}
