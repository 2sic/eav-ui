import { NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { transient } from 'projects/core';
import { FeatureNames } from 'projects/eav-ui/src/app/features/feature-names';
import { FeaturesService } from 'projects/eav-ui/src/app/features/features.service';
import { AgGridActionsBaseComponent } from 'projects/eav-ui/src/app/shared/ag-grid/ag-grid-actions-base';
import { TippyDirective } from 'projects/eav-ui/src/app/shared/directives/tippy.directive';
import { DataBundlesType } from './data-bundles-actions.models';

type DataBundleRow = {
  FileName: string;
  Name: string;
  Guid: string;
  Id: number;
  Entities: number;
  ContentType: number;
};

@Component({
  selector: 'app-data-bundle-actions',
  templateUrl: './data-bundles-actions.html',
  imports: [
    MatRippleModule,
    MatIconModule,
    MatMenuModule,
    TippyDirective,
    NgClass,
  ]
})
export class DataBundleActionsComponent extends AgGridActionsBaseComponent<DataBundleRow, DataBundlesType> {

  #featuresSvc = transient(FeaturesService);

  protected appExportAssetsAdvancedEnabled = this.#featuresSvc.isEnabled[FeatureNames.DataExportImportBundles];
}