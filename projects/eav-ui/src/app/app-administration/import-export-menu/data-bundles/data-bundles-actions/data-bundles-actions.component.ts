import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';
import { Component } from '@angular/core';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { ContentItem } from 'projects/eav-ui/src/app/content-items/models/content-item.model';
import { TippyDirective } from 'projects/eav-ui/src/app/shared/directives/tippy.directive';
import { DataBundlesActionsParams, DataBundlesType } from './data-bundles-actions.models';

@Component({
    selector: 'app-data-bundle-actions',
    templateUrl: './data-bundles-actions.component.html',
    imports: [
        MatRippleModule,
        MatIconModule,
        MatMenuModule,
        TippyDirective,
    ]
})
export class DataBundleActionsComponent implements ICellRendererAngularComp {
  item: ContentItem;

  private params: ICellRendererParams & DataBundlesActionsParams;

  agInit(params: ICellRendererParams & DataBundlesActionsParams): void {
    this.params = params;
    this.item = params.data;
  }

  refresh(params?: any): boolean {
    return true;
  }

  do(verb: DataBundlesType) {
    this.params.do(verb, this.item);
  }
}
