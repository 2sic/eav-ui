import { Component } from '@angular/core';
import { AgGridCellRendererBaseComponent } from '../../shared/ag-grid/ag-grid-cell-renderer-base';
import { TippyDirective } from '../../shared/directives/tippy.directive';
import { MetadataItem } from '../models/metadata.model';

@Component({
  selector: 'app-metadata-content-type',
  templateUrl: './metadata-content-type.html',
  styleUrls: ['./metadata-content-type.scss'],
  imports: [TippyDirective],
})
export class MetadataContentTypeComponent
  extends AgGridCellRendererBaseComponent<MetadataItem, string> {

  get description(): string { return this.data?._Type?.Description ?? ''; }
  
  get contentType(): string { return this.value ?? ''; }
}