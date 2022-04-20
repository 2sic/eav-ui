import { AgGridAngular } from '@ag-grid-community/angular';
import { GridOptions } from '@ag-grid-community/core';
import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
// tslint:disable-next-line:max-line-length
import { BehaviorSubject, catchError, distinctUntilChanged, forkJoin, map, Observable, of, share, startWith, Subject, Subscription, switchMap, tap, timer } from 'rxjs';
import { GlobalConfigService } from '../../../../../edit/shared/store/ngrx-data';
import { BooleanFilterComponent } from '../../shared/components/boolean-filter/boolean-filter.component';
import { FileUploadDialogComponent, FileUploadDialogData, FileUploadMessageTypes, FileUploadResult } from '../../shared/components/file-upload-dialog';
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

@Component({
  selector: 'app-license-info',
  templateUrl: './license-info.component.html',
  styleUrls: ['./license-info.component.scss'],
})
export class LicenseInfoComponent implements OnInit, OnDestroy {
  @ViewChild(AgGridAngular) private gridRef?: AgGridAngular;

  licenses$: Observable<License[]>;
  disabled$ = new BehaviorSubject(false);
  debugEnabled$ = this.globalConfigService.getDebugEnabled$();
  systemInfoSet$: Observable<SystemInfoSet>;
  gridOptions = this.buildGridOptions();

  private refreshLicenses$ = new Subject<void>();
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
    this.licenses$ = this.refreshLicenses$.pipe(
      startWith(undefined),
      switchMap(() => this.featuresConfigService.getLicenses().pipe(catchError(() => of(undefined)))),
      tap(() => this.disabled$.next(false)),
      share(),
    );
    this.systemInfoSet$ = this.zoneService.getSystemInfo().pipe(catchError(() => of(undefined)), share());
    this.subscription.add(
      this.disabled$.pipe(distinctUntilChanged()).subscribe(() => {
        this.gridRef?.api.refreshCells({ force: true, columns: ['Status'] });
      })
    );
  }

  ngOnDestroy(): void {
    this.disabled$.complete();
    this.subscription.unsubscribe();
  }

  trackLicenses(index: number, license: License): string {
    return license.Guid;
  }

  retrieveLicense(): void {
    this.featuresConfigService.retrieveLicense().subscribe({
      error: () => {
        this.snackBar.open('Failed to retrieve license. Please check console for more information', undefined, { duration: 3000 });
      },
      next: (info) => {
        const message = `License ${info.Success ? 'Info' : 'Error'}: ${info.Message}`;
        const duration = info.Success ? 3000 : 100000;
        const panelClass = info.Success ? undefined : 'snackbar-error';
        this.snackBar.open(message, undefined, { duration, panelClass });
      },
    });
  }

  openLicenseUpload(): void {
    const data: FileUploadDialogData = {
      title: 'Upload license',
      description: '',
      allowedFileTypes: 'json',
      upload$: (files) => this.featuresConfigService.uploadLicense(files[0]),
    };
    const dialogRef = this.dialog.open(FileUploadDialogComponent, {
      data,
      autoFocus: false,
      viewContainerRef: this.viewContainerRef,
      width: '650px',
    });
    dialogRef.afterClosed().subscribe((refresh?: boolean) => {
      if (refresh) {
        this.refreshLicenses$.next();
      }
    });
  }

  openLicenseRegistration(systemInfoSet: SystemInfoSet): void {
    window.open(`https://patrons.2sxc.org/register?fingerprint=${systemInfoSet.System.Fingerprint}`, '_blank');
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
    forkJoin([this.featuresConfigService.saveFeatures([state]), timer(100)]).subscribe({
      error: () => {
        this.refreshLicenses$.next();
      },
      next: () => {
        this.refreshLicenses$.next();
      },
    });
  }

  private buildGridOptions(): GridOptions {
    const gridOptions: GridOptions = {
      ...defaultGridOptions,
      columnDefs: [
        {
          headerName: 'ID',
          field: 'Id',
          width: 200,
          headerClass: 'dense',
          cellClass: 'id-action no-padding no-outline'.split(' '),
          sortable: true,
          filter: 'agTextColumnFilter',
          valueGetter: (params) => {
            const feature: Feature = params.data;
            return feature.NameId;
          },
          cellRenderer: IdFieldComponent,
          cellRendererParams: (() => {
            const params: IdFieldParams<Feature> = {
              tooltipGetter: (feature: Feature) => `NameId: ${feature.NameId}\nGUID: ${feature.Guid}`,
            };
            return params;
          })(),
        },
        {
          field: 'Name',
          flex: 3,
          minWidth: 250,
          cellClass: 'primary-action highlight'.split(' '),
          sortable: true,
          filter: 'agTextColumnFilter',
          onCellClicked: (params) => {
            const feature: Feature = params.data;
            this.showFeatureDetails(feature);
          },
          valueGetter: (params) => {
            const feature: Feature = params.data;
            return feature.Name;
          },
        },
        {
          field: 'Enabled',
          width: 80,
          headerClass: 'dense',
          cellClass: 'no-outline',
          sortable: true,
          filter: BooleanFilterComponent,
          cellRenderer: FeaturesListEnabledComponent,
          valueGetter: (params) => {
            const feature: Feature = params.data;
            return feature.Enabled;
          },
        },
        {
          field: 'EnabledReason',
          headerName: 'Reason',
          flex: 1,
          minWidth: 150,
          cellClass: 'no-outline',
          sortable: true,
          filter: 'agTextColumnFilter',
          cellRenderer: FeaturesListEnabledReasonComponent,
          valueGetter: (params) => {
            const feature: Feature = params.data;
            return feature.EnabledReason;
          },
        },
        {
          field: 'Expires',
          width: 100,
          cellClass: 'no-outline',
          sortable: true,
          filter: 'agTextColumnFilter',
          valueGetter: (params) => {
            const feature: Feature = params.data;
            const expires = feature.Expires?.split('T')[0];
            return expires?.startsWith('9999') ? 'never' : expires;
          },
        },
        {
          field: 'Status',
          headerName: '',
          width: 62,
          cellClass: 'secondary-action no-outline no-padding'.split(' '),
          pinned: 'right',
          cellRenderer: FeaturesStatusComponent,
          valueGetter: (params) => {
            const feature: Feature = params.data;
            return feature.EnabledStored;
          },
          cellRendererParams: (() => {
            const params: FeaturesStatusParams = {
              isDisabled: () => this.disabled$.value,
              onToggle: (feature, enabled) => this.toggleFeature(feature, enabled),
            };
            return params;
          }),
        },
      ],
    };
    return gridOptions;
  }
}
