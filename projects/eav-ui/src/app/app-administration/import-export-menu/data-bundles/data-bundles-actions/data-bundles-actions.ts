import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';
import { NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { transient } from 'projects/core';
import { ContentItem } from 'projects/eav-ui/src/app/content-items/models/content-item.model';
import { FeatureNames } from 'projects/eav-ui/src/app/features/feature-names';
import { FeaturesService } from 'projects/eav-ui/src/app/features/features.service';
import { TippyDirective } from 'projects/eav-ui/src/app/shared/directives/tippy.directive';
import { DataBundlesActionsParams, DataBundlesType } from './data-bundles-actions.models';

@Component({
  selector: 'app-data-bundle-actions',
  templateUrl: './data-bundles-actions.html',
  imports: [
    MatRippleModule,
    MatIconModule,
    MatMenuModule,
    TippyDirective,
    NgClass
  ]
})
export class DataBundleActionsComponent implements ICellRendererAngularComp {
  item: ContentItem;

  #featuresSvc = transient(FeaturesService);

  protected appExportAssetsAdvancedEnabled = this.#featuresSvc.isEnabled[FeatureNames.DataExportImportBundles];

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
