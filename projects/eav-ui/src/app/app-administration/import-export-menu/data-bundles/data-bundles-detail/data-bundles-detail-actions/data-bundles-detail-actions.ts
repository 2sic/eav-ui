import { Component } from '@angular/core';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { ContentItem } from 'projects/eav-ui/src/app/content-items/models/content-item.model';
import { AgGridActionsBaseComponent } from 'projects/eav-ui/src/app/shared/ag-grid/ag-grid-actions-base';
import { TippyDirective } from 'projects/eav-ui/src/app/shared/directives/tippy.directive';
import { DataBundlesDetailActionsParams, DataBundlesType } from './data-bundles-detail-actions.models';

@Component({
  selector: 'app-data-bundle-actions',
  templateUrl: './data-bundles-detail-actions.html',
  imports: [
    MatRippleModule,
    MatIconModule,
    MatMenuModule,
    TippyDirective,
  ]
})
export class DataBundlesDetailActionsComponent
  extends AgGridActionsBaseComponent<ContentItem, DataBundlesType, DataBundlesDetailActionsParams> {

  get item(): ContentItem {
    return this.data;
  }
}