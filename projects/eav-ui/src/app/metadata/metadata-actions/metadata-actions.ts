import { Component } from '@angular/core';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { AgGridCellRendererBaseComponent } from '../../shared/ag-grid/ag-grid-cell-renderer-base';
import { TippyDirective } from '../../shared/directives/tippy.directive';
import { MetadataItem } from '../models/metadata.model';

@Component({
  selector: 'app-metadata-actions',
  templateUrl: './metadata-actions.html',
  imports: [
    MatRippleModule,
    MatIconModule,
    TippyDirective,
  ]
})
export class MetadataActionsComponent
  extends AgGridCellRendererBaseComponent<MetadataItem, unknown, MetadataActionsParams> {

  deleteMetadata(): void {
    this.params.onDelete(this.data);
  }
}

export interface MetadataActionsParams {
  onDelete(metadata: MetadataItem): void;
}