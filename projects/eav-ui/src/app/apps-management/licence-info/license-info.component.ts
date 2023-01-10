import { AgGridAngular } from '@ag-grid-community/angular';
import { GridOptions } from '@ag-grid-community/core';
import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
// tslint:disable-next-line:max-line-length
import { BehaviorSubject, catchError, filter, forkJoin, map, Observable, of, pairwise, share, startWith, Subject, Subscription, switchMap, tap, timer } from 'rxjs';
import { FeatureState } from '../../features/models';
import { BaseComponent } from '../../shared/components/base-component/base.component';
import { BooleanFilterComponent } from '../../shared/components/boolean-filter/boolean-filter.component';
import { IdFieldComponent } from '../../shared/components/id-field/id-field.component';
import { IdFieldParams } from '../../shared/components/id-field/id-field.models';
import { defaultGridOptions } from '../../shared/constants/default-grid-options.constants';
import { Feature } from '../../features/models/feature.model';
import { License } from '../models/license.model';
import { FeaturesConfigService } from '../services/features-config.service';
import { GoToRegistration } from '../sub-dialogs/registration/go-to-registration';
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
export class LicenseInfoComponent extends BaseComponent implements OnInit, OnDestroy {
  @ViewChild(AgGridAngular) private gridRef?: AgGridAngular;

  licenses$: Observable<License[]>;
  disabled$ = new BehaviorSubject(false);
  gridOptions = this.buildGridOptions();

  private refreshLicenses$ = new Subject<void>();

  constructor(
    protected router: Router,
    protected route: ActivatedRoute,
    private featuresConfigService: FeaturesConfigService,
    private dialog: MatDialog,
    private viewContainerRef: ViewContainerRef,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    super(router, route);
  }

  ngOnInit(): void {
    this.licenses$ = this.refreshLicenses$.pipe(
      startWith(undefined),
      switchMap(() => this.featuresConfigService.getLicenses().pipe(catchError(() => of(undefined)))),
      tap(() => this.disabled$.next(false)),
      share(),
    );
    this.subscription.add(this.refreshOnChildClosedDeep().subscribe(() => { this.refreshLicenses$.next(); }));
  }

  ngOnDestroy(): void {
    this.disabled$.complete();
    super.ngOnDestroy();
  }

  trackLicenses(index: number, license: License): string {
    return license.Guid;
  }

  openRegistration(): void {
    this.router.navigate([GoToRegistration.getUrl()], { relativeTo: this.route.firstChild });
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
              tooltipGetter: (feature: Feature) => feature.NameId,
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
