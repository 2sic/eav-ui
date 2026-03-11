import { Component } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AgGridCellRendererBaseComponent } from '../../shared/ag-grid/ag-grid-cell-renderer-base';

@Component({
  selector: 'app-content-type-fields-drag',
  templateUrl: './content-type-fields-drag.html',
  styleUrls: ['./content-type-fields-drag.scss'],
  imports: [MatProgressSpinnerModule]
})
export class ContentTypeFieldsDragComponent
  extends AgGridCellRendererBaseComponent<unknown, unknown, ContentTypeFieldsDragParams> {

  get isReordering(): () => boolean { return this.params.isReordering; }
}

export interface ContentTypeFieldsDragParams {
  isReordering: () => boolean;
}