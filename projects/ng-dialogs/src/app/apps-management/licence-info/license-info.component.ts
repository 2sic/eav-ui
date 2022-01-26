import { AllCommunityModules, GridOptions } from '@ag-grid-community/all-modules';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { IdFieldComponent } from '../../shared/components/id-field/id-field.component';
import { IdFieldParams } from '../../shared/components/id-field/id-field.models';
import { defaultGridOptions } from '../../shared/constants/default-grid-options.constants';
import { FeaturesListNameComponent } from '../ag-grid-components/features-list-name/features-list-name.component';
import { Feature } from '../models/feature.model';
import { License } from '../models/license.model';
import { FeaturesConfigService } from '../services/features-config.service';

@Component({
  selector: 'app-license-info',
  templateUrl: './license-info.component.html',
  styleUrls: ['./license-info.component.scss'],
})
export class LicenseInfoComponent implements OnInit, OnDestroy {
  licenses$ = new BehaviorSubject<License[]>(undefined);

  modules = AllCommunityModules;
  gridOptions: GridOptions = {
    ...defaultGridOptions,
    frameworkComponents: {
      idFieldComponent: IdFieldComponent,
      featuresListNameComponent: FeaturesListNameComponent,
    },
    columnDefs: [
      {
        field: 'ID', width: 200, headerClass: 'dense', cellClass: 'id-action no-padding no-outline',
        cellRenderer: 'idFieldComponent', sortable: true, filter: 'agTextColumnFilter',
        valueGetter: (params) => (params.data as Feature).NameId,
        cellRendererParams: {
          tooltipGetter: (feature: Feature) => `NameId: ${feature.NameId}\nGUID: ${feature.Guid}`,
        } as IdFieldParams,
      },
      {
        field: 'Name', flex: 3, minWidth: 250, cellClass: 'primary-action highlight', sortable: true,
        filter: 'agTextColumnFilter', cellRenderer: 'featuresListNameComponent',
        onCellClicked: (params) => this.openFeature(params.data),
        valueGetter: (params) => (params.data as Feature).Name,
      },
    ],
  };

  constructor(private featuresConfigService: FeaturesConfigService) { }

  ngOnInit() {
    this.fetchLicenses();
  }

  ngOnDestroy() {
    this.licenses$.complete();
  }

  trackLicenses(index: number, license: License): string {
    return license.Guid;
  }

  private fetchLicenses() {
    this.featuresConfigService.getLicenses().subscribe({
      error: () => {
        this.licenses$.next(undefined);
      },
      next: (licenses) => {
        this.licenses$.next(licenses);
      },
    });
  }

  private openFeature(feature: Feature) {
    window.open(`https://2sxc.org/r/f/${feature.Guid}`, '_blank');
  }
}
