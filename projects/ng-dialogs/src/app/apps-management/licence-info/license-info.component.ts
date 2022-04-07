import { AllCommunityModules, GridOptions } from '@ag-grid-community/all-modules';
import { AgGridAngular } from '@ag-grid-community/angular';
import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject, distinctUntilChanged, forkJoin, Observable, share, Subscription, timer } from 'rxjs';
import { GlobalConfigService } from '../../../../../edit/shared/store/ngrx-data';
import { BooleanFilterComponent } from '../../shared/components/boolean-filter/boolean-filter.component';
import { IdFieldComponent } from '../../shared/components/id-field/id-field.component';
import { IdFieldParams } from '../../shared/components/id-field/id-field.models';
import { defaultGridOptions } from '../../shared/constants/default-grid-options.constants';
import { Feature, FeatureState } from '../models/feature.model';
import { License } from '../models/license.model';
import { SystemInfoSet } from '../models/system-info.model';
import { FeaturesConfigService } from '../services/features-config.service';
import { ZoneService } from '../services/zone.service';
import { FeatureDetailsDialogComponent } from './feature-details-dialog/feature-details-dialog.component';
import { FeatureDetailsDialogData } from './feature-details-dialog/feature-details-dialog.models';
import { FeaturesListEnabledReasonComponent } from './features-list-enabled-reason/features-list-enabled-reason.component';
import { FeaturesListEnabledComponent } from './features-list-enabled/features-list-enabled.component';
import { FeaturesStatusComponent } from './features-status/features-status.component';
import { FeaturesStatusParams } from './features-status/features-status.models';
import { UploadLicenseDialogComponent } from './upload-license-dialog/upload-license-dialog.component';

@Component({
  selector: 'app-license-info',
  templateUrl: './license-info.component.html',
  styleUrls: ['./license-info.component.scss'],
})
export class LicenseInfoComponent implements OnInit, OnDestroy {
  @ViewChild(AgGridAngular) private gridRef?: AgGridAngular;

  licenses$ = new BehaviorSubject<License[]>(undefined);
  disabled$ = new BehaviorSubject(false);
  debugEnabled$ = this.globalConfigService.getDebugEnabled$();
  systemInfoSet$: Observable<SystemInfoSet>;

  modules = AllCommunityModules;
  gridOptions: GridOptions = {
    ...defaultGridOptions,
    columnDefs: [
      {
        headerName: 'ID', field: 'Id', width: 200, headerClass: 'dense', cellClass: 'id-action no-padding no-outline'.split(' '),
        cellRenderer: IdFieldComponent, sortable: true, filter: 'agTextColumnFilter',
        valueGetter: (params) => (params.data as Feature).NameId,
        cellRendererParams: {
          tooltipGetter: (feature: Feature) => `NameId: ${feature.NameId}\nGUID: ${feature.Guid}`,
        } as IdFieldParams,
      },
      {
        field: 'Name', flex: 3, minWidth: 250, cellClass: 'primary-action highlight'.split(' '), sortable: true, filter: 'agTextColumnFilter',
        onCellClicked: (params) => this.showFeatureDetails(params.data as Feature),
        valueGetter: (params) => (params.data as Feature).Name,
      },
      {
        field: 'Enabled', width: 80, headerClass: 'dense', cellClass: 'no-outline',
        sortable: true, filter: BooleanFilterComponent, cellRenderer: FeaturesListEnabledComponent,
        valueGetter: (params) => (params.data as Feature).Enabled,
      },
      {
        field: 'EnabledReason', headerName: 'Reason', flex: 1, minWidth: 150, cellClass: 'no-outline', sortable: true,
        filter: 'agTextColumnFilter', cellRenderer: FeaturesListEnabledReasonComponent,
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
        field: 'Status', headerName: '', width: 62, cellClass: 'secondary-action no-outline no-padding'.split(' '), pinned: 'right',
        cellRenderer: FeaturesStatusComponent,
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
    private globalConfigService: GlobalConfigService,
    private snackBar: MatSnackBar,
    private zoneService: ZoneService,
  ) { }

  ngOnInit(): void {
    this.fetchLicenses();
    this.systemInfoSet$ = this.zoneService.getSystemInfo().pipe(share());
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

  retrieveLicense(): void {
    this.featuresConfigService.retrieveLicense().subscribe(info => {
      const message = `License ${info.Success ? 'Info' : 'Error'}: ${info.Message}`;
      const duration = info.Success ? 3000 : 100000;
      const panelClass = info.Success ? undefined : 'snackbar-error';
      this.snackBar.open(message, undefined, { duration, panelClass });
    });
  }

  openLicenseUpload(): void {
    const dialogRef = this.dialog.open(UploadLicenseDialogComponent, {
      autoFocus: false,
      viewContainerRef: this.viewContainerRef,
      width: '650px',
    });
    dialogRef.afterClosed().subscribe((refresh?: boolean) => {
      if (refresh) {
        this.fetchLicenses();
      }
    });
  }

  openLicenseRegistration(systemInfoSet: SystemInfoSet): void {
    window.open(`https://patrons.2sxc.org/register?fingerprint=${systemInfoSet.System.Fingerprint}`, '_blank');
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
    const state: FeatureState = {
      FeatureGuid: feature.Guid,
      Enabled: enabled,
    };
    forkJoin([this.featuresConfigService.saveFeatures([state]), timer(100)]).subscribe(() => {
      this.fetchLicenses();
    });
  }
}
