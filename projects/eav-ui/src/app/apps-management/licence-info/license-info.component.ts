import { AgGridAngular } from '@ag-grid-community/angular';
import { GridOptions } from '@ag-grid-community/core';
import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
// tslint:disable-next-line:max-line-length
import { BehaviorSubject, catchError, forkJoin, map, Observable, of, share, startWith, Subject, switchMap, tap, timer } from 'rxjs';
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
import { ExpirationExtension } from '../../features/expiration-extension';

@Component({
  selector: 'app-license-info',
  templateUrl: './license-info.component.html',
  styleUrls: ['./license-info.component.scss'],
})
export class LicenseInfoComponent extends BaseComponent implements OnInit, OnDestroy {
  @ViewChild(AgGridAngular) private gridRef?: AgGridAngular;

  disabled$ = new BehaviorSubject(false);
  gridOptions = this.buildGridOptions();

  private refreshLicenses$ = new Subject<void>();

  viewModel$: Observable<LicenseInfoViewModel>;

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
    this.subscription.add(this.refreshOnChildClosedShallow().subscribe(() => { this.refreshLicenses$.next(); }));
    this.viewModel$ = //combineLatest([
      this.refreshLicenses$.pipe(
        startWith(undefined),
        switchMap(() => this.featuresConfigService.getLicenses().pipe(catchError(() => of(undefined)))),
        tap(() => this.disabled$.next(false)),

        // Fiddle with the data for development tests
        // 2023-11-16 2dm disabled - causes trouble in production
        // @STV - do you still need this? or is this a forgotten debug code?
        // map(licenses => {
        //   var licTesting = licenses[licenses.length - 2];
        //   licTesting.Features[licTesting.Features.length - 1].Expiration = "2023-08-25";
        //   return licenses;
        // }),

        // Expand the data to have pre-calculated texts/states
        map(licenses => licenses.map(l => {
          // const expandedFeatures = l.Features.map(f => ExpirationExtension.expandFeature(f));
          return ({
            ...ExpirationExtension.expandLicense(l),
            Features: l.Features.map(f => ExpirationExtension.expandFeature(f)),
          });
        })),

        // Share the resulting stream with all subscribers
        share(),
      )
    //])
    .pipe(
      map((licenses) => ({ licenses })),
    );
  }

  ngOnDestroy(): void {
    this.disabled$.complete();
    super.ngOnDestroy();
  }

  trackLicenses(index: number, license: License): string {
    return license.Guid;
  }

  openRegistration(): void {
    this.router.navigate([GoToRegistration.getUrl()], { relativeTo: this.route.parent.firstChild });
  }

  private showFeatureDetails(feature: Feature): void {
    const data: FeatureDetailsDialogData = {
      feature,
    };
    this.dialog.open(FeatureDetailsDialogComponent, {
      autoFocus: false,
      data,
      viewContainerRef: this.viewContainerRef,
      width: '600px',
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

  // Note: @SDV
  // I think this should serve as a good example of how to use the grid
  // 1. eg. with cellDefaults and similar initial objects containing most commonly used options here
  // 2. Also we should probably never add a valueGetter for the simple properties
  // ...not sure why it's even in here, my guess is copy-paste of code which wasn't understood properly
  // 3. I think the header-name should always be the first line, then the field
  private buildGridOptions(): GridOptions {
    const cellDefaults = {
      cellClass: 'no-outline',
      sortable: true,
    };
    const cellDefaultsTextFilter = {
      ...cellDefaults,
      filter: 'agTextColumnFilter',
    };

    const gridOptions: GridOptions = {
      ...defaultGridOptions,
      columnDefs: [
        {
          headerName: 'ID',
          field: 'NameId',
          ...cellDefaultsTextFilter,
          width: 200,
          headerClass: 'dense',
          cellClass: 'id-action no-padding no-outline'.split(' '),
          // TODO: @SDV - most of these columns had a valueGetter that was 3 lines long
          // it was easy to reduce to 1 - but actually it is not needed!
          // Original - too long
          // valueGetter: (params) => {
          //   const feature: Feature = params.data;
          //   return feature.NameId;
          // },
          // Optimized - 1 line - but actually not needed
          // valueGetter: (params) => (params.data as Feature).NameId,
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
          ...cellDefaultsTextFilter,
          flex: 3,
          minWidth: 250,
          cellClass: 'primary-action highlight'.split(' '),
          onCellClicked: (params) => {
            this.showFeatureDetails(params.data as Feature);
          },
          // valueGetter: (params) => (params.data as Feature).Name,
        },
        {
          field: 'IsEnabled',
          headerName: 'Enabled',
          ...cellDefaults,
          width: 80,
          headerClass: 'dense',
          filter: BooleanFilterComponent,
          cellRenderer: FeaturesListEnabledComponent,
          // valueGetter: (params) => (params.data as Feature).Enabled,
        },
        {
          headerName: 'Reason',
          field: 'EnabledReason',
          ...cellDefaultsTextFilter,
          flex: 1,
          minWidth: 150,
          cellRenderer: FeaturesListEnabledReasonComponent,
          // valueGetter: (params) => (params.data as Feature).EnabledReason,
        },
        {
          headerName: 'Expiration',
          field: 'ExpMessage',
          ...cellDefaultsTextFilter,
          width: 120,
          // valueGetter: (params) => (params.data as FeatureWithUi)?.ExpirationText,
          tooltipValueGetter: (params) => (params.data as Feature & ExpirationExtension)?.Expiration,
        },
        {
          headerName: '',
          field: 'EnabledInConfiguration',
          width: 62,
          cellClass: 'secondary-action no-outline no-padding'.split(' '),
          pinned: 'right',
          cellRenderer: FeaturesStatusComponent,
          // valueGetter: (params) => (params.data as Feature).EnabledInConfiguration,
          cellRendererParams: (() => {
            const params: FeaturesStatusParams & IdFieldParams<Feature> = {
              isDisabled: (feature) => !feature.IsConfigurable || this.disabled$.value,
              onToggle: (feature, enabled) => this.toggleFeature(feature, enabled),
              tooltipGetter: (feature: Feature) => feature.IsConfigurable ? "Toggle off | default | on" : "This feature can't be configured",
            };
            return params;
          }),
        },
      ],
    };
    return gridOptions;
  }
}


interface LicenseInfoViewModel {
  licenses: (License & ExpirationExtension)[];
}
