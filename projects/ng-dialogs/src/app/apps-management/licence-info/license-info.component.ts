import { AllCommunityModules, GridOptions } from '@ag-grid-community/all-modules';
import { AgGridAngular } from '@ag-grid-community/angular';
import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject, distinctUntilChanged, forkJoin, Subscription, timer } from 'rxjs';
import { BooleanFilterComponent } from '../../shared/components/boolean-filter/boolean-filter.component';
import { IdFieldComponent } from '../../shared/components/id-field/id-field.component';
import { IdFieldParams } from '../../shared/components/id-field/id-field.models';
import { defaultGridOptions } from '../../shared/constants/default-grid-options.constants';
import { FeaturesListEnabledReasonComponent } from '../ag-grid-components/features-list-enabled-reason/features-list-enabled-reason.component';
import { FeaturesListEnabledComponent } from '../ag-grid-components/features-list-enabled/features-list-enabled.component';
import { FeaturesStatusComponent } from '../ag-grid-components/features-status/features-status.component';
import { FeaturesStatusParams } from '../ag-grid-components/features-status/features-status.models';
import { Feature, FeatureState } from '../models/feature.model';
import { License } from '../models/license.model';
import { FeaturesConfigService } from '../services/features-config.service';
import { FeatureDetailsDialogComponent } from './feature-details-dialog/feature-details-dialog.component';
import { FeatureDetailsDialogData } from './feature-details-dialog/feature-details-dialog.models';

@Component({
  selector: 'app-license-info',
  templateUrl: './license-info.component.html',
  styleUrls: ['./license-info.component.scss'],
})
export class LicenseInfoComponent implements OnInit, OnDestroy {
  @ViewChild(AgGridAngular) private gridRef: AgGridAngular;

  licenses$ = new BehaviorSubject<License[]>(undefined);
  disabled$ = new BehaviorSubject(false);

  modules = AllCommunityModules;
  gridOptions: GridOptions = {
    ...defaultGridOptions,
    frameworkComponents: {
      booleanFilterComponent: BooleanFilterComponent,
      idFieldComponent: IdFieldComponent,
      featuresListEnabledComponent: FeaturesListEnabledComponent,
      featuresListEnabledReasonComponent: FeaturesListEnabledReasonComponent,
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
        field: 'Name', flex: 3, minWidth: 250, cellClass: 'primary-action highlight', sortable: true, filter: 'agTextColumnFilter',
        onCellClicked: (params) => this.showFeatureDetails(params.data as Feature),
        valueGetter: (params) => (params.data as Feature).Name,
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
        valueGetter: (params) => {
          const expires = (params.data as Feature).Expires?.split('T')[0];
          if (expires.startsWith('9999')) { return 'never'; }
          return expires;
        },
      },
      {
        field: 'Status', headerName: '', width: 62, cellClass: 'secondary-action no-outline no-padding', pinned: 'right',
        cellRenderer: 'featuresStatusComponent',
        valueGetter: (params) => (params.data as Feature).EnabledStored,
        cellRendererParams: {
          isDisabled: () => this.disabled$.value,
          onToggle: (feature, enabled) => this.toggleFeature(feature, enabled),
        } as FeaturesStatusParams,
      },
    ],
  };

  private subscription = new Subscription();

  constructor(
    private featuresConfigService: FeaturesConfigService,
    private dialog: MatDialog,
    private viewContainerRef: ViewContainerRef,
    private changeDetectorRef: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    this.fetchLicenses();
    this.subscription.add(
      this.disabled$.pipe(distinctUntilChanged()).subscribe(() => {
        this.gridRef?.api.refreshCells({ force: true, columns: ['Status'] });
      })
    );
  }

  ngOnDestroy(): void {
    this.licenses$.complete();
    this.disabled$.complete();
    this.subscription.unsubscribe();
  }

  trackLicenses(index: number, license: License): string {
    return license.Guid;
  }

  private fetchLicenses(): void {
    this.featuresConfigService.getLicenses().subscribe({
      error: () => {
        this.licenses$.next(undefined);
        this.disabled$.next(false);
      },
      next: (licenses) => {
        this.licenses$.next(licenses);
        this.disabled$.next(false);
      },
    });
  }

  private showFeatureDetails(feature: Feature): void {
    const data: FeatureDetailsDialogData = {
      feature,
    };
    this.dialog.open(FeatureDetailsDialogComponent, {
      autoFocus: false,
      data,
      viewContainerRef: this.viewContainerRef,
      width: '650px',
    });
    this.changeDetectorRef.markForCheck();
  }

  private toggleFeature(feature: Feature, enabled: boolean): void {
    this.disabled$.next(true);
    const features = this.licenses$.value.reduce((featuresArray, license) => {
      featuresArray.push(...license.Features);
      return featuresArray;
    }, [] as Feature[]);
    const states = features.map(f => {
      const state: FeatureState = {
        FeatureGuid: f.Guid,
        Enabled: f.Guid === feature.Guid ? enabled : f.EnabledStored,
      };
      return state;
    });
    forkJoin([this.featuresConfigService.saveFeatures(states), timer(100)]).subscribe(() => {
      this.fetchLicenses();
    });
  }
}
