import { AllCommunityModules, GridOptions, ICellRendererParams } from '@ag-grid-community/all-modules';
import { AgGridAngular } from '@ag-grid-community/angular';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { BehaviorSubject, distinctUntilChanged, forkJoin, Subscription, timer } from 'rxjs';
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
  @ViewChild(AgGridAngular) private gridRef: AgGridAngular;

  features$ = new BehaviorSubject<Feature[]>(undefined);
  disabled$ = new BehaviorSubject(false);
  private subscription = new Subscription();

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
        headerName: 'ID', field: 'Id', width: 200, headerClass: 'dense', cellClass: 'id-action no-padding no-outline',
        cellRenderer: 'idFieldComponent', sortable: true, filter: 'agTextColumnFilter',
        valueGetter: (params) => (params.data as Feature).NameId,
        cellRendererParams: {
          tooltipGetter: (feature: Feature) => `NameId: ${feature.NameId}\nGUID: ${feature.Guid}`,
        } as IdFieldParams,
      },
      {
        field: 'Name', flex: 3, minWidth: 250, cellClass: 'primary-action highlight', sortable: true,
        filter: 'agTextColumnFilter', cellRenderer: 'featuresListNameComponent',
        onCellClicked: (params) => this.openFeature(params.data as Feature),
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
        field: 'Status', headerName: '', width: 52, cellClass: 'secondary-action no-outline no-padding', pinned: 'right',
        cellRenderer: 'featuresStatusComponent',
        valueGetter: (params) => (params.data as Feature).EnabledStored,
        cellRendererParams: {
          isDisabled: () => this.disabled$.value,
          onToggle: (feature, enabled) => this.toggleFeature(feature, enabled),
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

  constructor(private featuresConfigService: FeaturesConfigService) { }

  ngOnInit() {
    this.fetchFeatures();
    this.subscription.add(
      this.disabled$.pipe(distinctUntilChanged()).subscribe(() => {
        this.gridRef?.api.refreshCells({ force: true, columns: ['Status'] });
      })
    );
  }

  ngOnDestroy() {
    this.features$.complete();
    this.disabled$.complete();
    this.subscription.unsubscribe();
  }

  private openFeature(feature: Feature) {
    window.open(`https://2sxc.org/r/f/${feature.Guid}`, '_blank');
  }

  private toggleFeature(feature: Feature, enabled: boolean) {
    this.disabled$.next(true);
    const states = this.features$.value.map(f => {
      const state: FeatureState = {
        FeatureGuid: f.Guid,
        Enabled: f.Guid === feature.Guid ? enabled : f.EnabledStored,
      };
      return state;
    });
    forkJoin([this.featuresConfigService.saveFeatures(states), timer(100)]).subscribe(() => {
      this.fetchFeatures();
    });
  }

  private fetchFeatures() {
    this.featuresConfigService.getAll().subscribe(features => {
      this.features$.next(features);
      this.disabled$.next(false);
    });
  }
}
