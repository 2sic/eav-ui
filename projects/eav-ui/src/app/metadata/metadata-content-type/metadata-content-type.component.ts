import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';
import { Component } from '@angular/core';
import { MetadataItem } from '../models/metadata.model';
import { TippyDirective } from '../../shared/directives/tippy.directive';

@Component({
    selector: 'app-metadata-content-type',
    templateUrl: './metadata-content-type.component.html',
    styleUrls: ['./metadata-content-type.component.scss'],
    imports: [TippyDirective,]
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
