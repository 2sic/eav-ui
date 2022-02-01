import { AllCommunityModules, GridOptions, ICellRendererParams } from '@ag-grid-community/all-modules';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { BooleanFilterComponent } from '../../shared/components/boolean-filter/boolean-filter.component';
import { IdFieldComponent } from '../../shared/components/id-field/id-field.component';
import { IdFieldParams } from '../../shared/components/id-field/id-field.models';
import { defaultGridOptions } from '../../shared/constants/default-grid-options.constants';
import { FeaturesListEnabledReasonComponent } from '../ag-grid-components/features-list-enabled-reason/features-list-enabled-reason.component';
import { FeaturesListEnabledComponent } from '../ag-grid-components/features-list-enabled/features-list-enabled.component';
import { FeaturesListNameComponent } from '../ag-grid-components/features-list-name/features-list-name.component';
import { FeaturesListPublicComponent } from '../ag-grid-components/features-list-public/features-list-public.component';
import { FeaturesListSecurityComponent } from '../ag-grid-components/features-list-security/features-list-security.component';
import { FeaturesListUiComponent } from '../ag-grid-components/features-list-ui/features-list-ui.component';
import { FeaturesStatusComponent } from '../ag-grid-components/features-status/features-status.component';
import { FeaturesStatusParams } from '../ag-grid-components/features-status/features-status.models';
import { Feature, FeatureState } from '../models/feature.model';
import { FeaturesConfigService } from '../services/features-config.service';

@Component({
  selector: 'app-manage-features',
  templateUrl: './manage-features.component.html',
  styleUrls: ['./manage-features.component.scss'],
})
export class ManageFeaturesComponent implements OnInit, OnDestroy {
  modules = AllCommunityModules;
  gridOptions: GridOptions = {
    ...defaultGridOptions,
    frameworkComponents: {
      booleanFilterComponent: BooleanFilterComponent,
      idFieldComponent: IdFieldComponent,
      featuresListEnabledComponent: FeaturesListEnabledComponent,
      featuresListUiComponent: FeaturesListUiComponent,
      featuresListPublicComponent: FeaturesListPublicComponent,
      featuresListNameComponent: FeaturesListNameComponent,
      featuresListEnabledReasonComponent: FeaturesListEnabledReasonComponent,
      featuresListSecurityComponent: FeaturesListSecurityComponent,
      featuresStatusComponent: FeaturesStatusComponent,
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
      {
        field: 'License', flex: 1, minWidth: 150, cellClass: 'no-outline', sortable: true, filter: 'agTextColumnFilter',
        valueGetter: (params) => (params.data as Feature).License,
        cellRenderer: (params: ICellRendererParams) => {
          const feature: Feature = params.data;
          return `<div ${feature.LicenseEnabled ? '' : 'style="text-decoration: line-through;"'}>${params.value}</div>`;
        },
      },
      {
        field: 'Enabled', width: 80, headerClass: 'dense', cellClass: 'no-outline',
        sortable: true, filter: 'booleanFilterComponent', cellRenderer: 'featuresListEnabledComponent',
        valueGetter: (params) => (params.data as Feature).Enabled,
      },
      {
        field: 'EnabledReason', headerName: 'Reason', flex: 1, minWidth: 150, cellClass: 'no-outline', sortable: true,
        filter: 'agTextColumnFilter', cellRenderer: 'featuresListEnabledReasonComponent',
        valueGetter: (params) => (params.data as Feature).EnabledReason,
      },
      {
        field: 'Expires', width: 100, cellClass: 'no-outline',
        sortable: true, filter: 'agTextColumnFilter',
        valueGetter: (params) => (params.data as Feature).Expires?.split('T')[0],
      },
      {
        field: 'Security', width: 80, cellClass: 'no-outline', cellRenderer: 'featuresListSecurityComponent',
        sortable: true, filter: 'agNumberColumnFilter',
        valueGetter: (params) => (params.data as Feature).Security.Impact,
      },
      {
        field: 'Status', width: 72, headerClass: 'dense', cellClass: 'no-padding no-outline',
        cellRenderer: 'featuresStatusComponent', sortable: true, filter: 'booleanFilterComponent',
        valueGetter: (params) => (params.data as Feature).EnabledStored,
        cellRendererParams: {
          onEnabledToggle: (feature, enabled) => this.toggleFeature(feature, enabled),
        } as FeaturesStatusParams,
      },
      // {
      //   field: 'UI', width: 70, headerClass: 'dense', cellClass: 'no-outline',
      //   sortable: true, filter: 'booleanFilterComponent', cellRenderer: 'featuresListUiComponent',
      //   valueGetter: (params) => (params.data as Feature).Ui,
      // },
      // {
      //   field: 'Public', width: 70, headerClass: 'dense', cellClass: 'no-outline',
      //   sortable: true, filter: 'booleanFilterComponent', cellRenderer: 'featuresListPublicComponent',
      //   valueGetter: (params) => (params.data as Feature).Public,
      // },
    ],
  };

  features$ = new BehaviorSubject<Feature[]>(undefined);

  constructor(private featuresConfigService: FeaturesConfigService) { }

  ngOnInit() {
    this.fetchFeatures();
  }

  ngOnDestroy() {
    this.features$.complete();
  }

  private openFeature(feature: Feature) {
    window.open(`https://2sxc.org/r/f/${feature.Guid}`, '_blank');
  }

  private toggleFeature(feature: Feature, enabled: boolean) {
    const state: FeatureState = {
      FeatureGuid: feature.Guid,
      Enabled: enabled,
    };
    this.featuresConfigService.saveFeatures([state]).subscribe(() => {
      this.fetchFeatures();
    });
  }

  private fetchFeatures() {
    this.featuresConfigService.getAll().subscribe(features => {
      this.features$.next(features);
    });
  }
}
