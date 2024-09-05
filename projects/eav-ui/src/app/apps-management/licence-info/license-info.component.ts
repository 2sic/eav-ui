import { AgGridAngular } from '@ag-grid-community/angular';
import { GridOptions } from '@ag-grid-community/core';
import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { MatDialog, MatDialogActions } from '@angular/material/dialog';
import { RouterOutlet } from '@angular/router';
import { BehaviorSubject, catchError, forkJoin, map, Observable, of, share, startWith, Subject, switchMap, tap, timer } from 'rxjs';
import { FeatureState } from '../../features/models';
import { BooleanFilterComponent } from '../../shared/components/boolean-filter/boolean-filter.component';
import { IdFieldComponent } from '../../shared/components/id-field/id-field.component';
import { IdFieldParams } from '../../shared/components/id-field/id-field.models';
import { defaultGridOptions } from '../../shared/constants/default-grid-options.constants';
import { Feature } from '../../features/models/feature.model';
import { License } from '../models/license.model';
import { FeatureDetailsDialogComponent } from './feature-details-dialog/feature-details-dialog.component';
import { FeatureDetailsDialogData } from './feature-details-dialog/feature-details-dialog.models';
import { FeaturesListEnabledReasonComponent } from './features-list-enabled-reason/features-list-enabled-reason.component';
import { FeaturesListEnabledComponent } from './features-list-enabled/features-list-enabled.component';
import { FeaturesStatusComponent } from './features-status/features-status.component';
import { FeaturesStatusParams } from './features-status/features-status.models';
import { ExpirationExtension } from '../../features/expiration-extension';
import { ActiveFeaturesCountPipe } from './active-features-count.pipe';
import { LicensesOrderPipe } from './licenses-order.pipe';
import { MatButtonModule } from '@angular/material/button';
import { AgGridHeightDirective } from './ag-grid-height.directive';
import { NgClass, AsyncPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { TippyDirective } from '../../shared/directives/tippy.directive';
import { FeaturesConfigService } from '../services/features-config.service';
import { ModuleRegistry } from '@ag-grid-community/core';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { ColumnDefinitions } from '../../shared/ag-grid/column-definitions';
import { SxcGridModule } from '../../shared/modules/sxc-grid-module/sxc-grid.module';
import { transient } from '../../core';
import { DialogRoutingService } from '../../shared/routing/dialog-routing.service';

@Component({
  selector: 'app-license-info',
  templateUrl: './license-info.component.html',
  styleUrls: ['./license-info.component.scss'],
  standalone: true,
  imports: [
    MatExpansionModule,
    MatIconModule,
    NgClass,
    SxcGridModule,
    AgGridHeightDirective,
    MatDialogActions,
    MatButtonModule,
    RouterOutlet,
    AsyncPipe,
    LicensesOrderPipe,
    ActiveFeaturesCountPipe,
    TippyDirective,
  ],
})
export class LicenseInfoComponent implements OnInit, OnDestroy {
  @ViewChild(AgGridAngular) private gridRef?: AgGridAngular;

  disabled$ = new BehaviorSubject(false);
  gridOptions = this.buildGridOptions();

  #refreshLicenses$ = new Subject<void>();

  viewModel$: Observable<LicenseInfoViewModel>;

  #featuresConfigSvc = transient(FeaturesConfigService);
  #dialogRouter = transient(DialogRoutingService);

  constructor(
    private dialog: MatDialog,
    private viewContainerRef: ViewContainerRef,
    private changeDetectorRef: ChangeDetectorRef,
  ) {
    ModuleRegistry.registerModules([ClientSideRowModelModule]);
  }

  ngOnInit(): void {
    this.#dialogRouter.doOnDialogClosed(() => this.#refreshLicenses$.next());
    this.viewModel$ = 
      this.#refreshLicenses$.pipe(
        startWith(undefined),
        switchMap(() => this.#featuresConfigSvc.getLicenses().pipe(catchError(() => of(undefined)))),
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
  }

  trackLicenses(index: number, license: License): string {
    return license.Guid;
  }


  openRegistration(): void {
    const router = this.#dialogRouter.router;
    router.navigate([router.url.replace('license', '') + "/registration"]);
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
      FeatureGuid: feature.guid,
      Enabled: enabled,
    };
    forkJoin([this.#featuresConfigSvc.saveFeatures([state]), timer(100)]).subscribe({
      error: () => {
        this.#refreshLicenses$.next();
      },
      next: () => {
        this.#refreshLicenses$.next();
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
    const gridOptions: GridOptions = {
      ...defaultGridOptions,
      columnDefs: [
        {
          headerName: 'ID',
          field: 'nameId',
          filter: 'agTextColumnFilter',
          width: 200,
          headerClass: 'dense',
          sortable: true,
          cellClass: 'id-action no-padding no-outline'.split(' '),
          cellRenderer: IdFieldComponent,
          cellRendererParams: (() => {
            const params: IdFieldParams<Feature> = {
              tooltipGetter: (feature: Feature) => feature.nameId,
            };
            return params;
          })(),
        },
        {
          ...ColumnDefinitions.TextWideFlex3,
          field: 'Name',
          cellClass: 'primary-action highlight'.split(' '),
          onCellClicked: (params) => {
            this.showFeatureDetails(params.data as Feature);
          },
        },
        {

          headerName: 'Enabled',
          field: 'isEnabled',
          width: 80,
          cellClass: 'no-outline',
          headerClass: 'dense',
          sortable: true,
          filter: BooleanFilterComponent,
          cellRenderer: FeaturesListEnabledComponent,
        },
        {
          ...ColumnDefinitions.TextNarrow,
          headerName: 'Reason',
          field: 'enabledReason',
          cellRenderer: FeaturesListEnabledReasonComponent,
        },
        {
          headerName: 'Expiration',
          field: 'ExpMessage',
          filter: 'agTextColumnFilter',
          width: 120,
          tooltipValueGetter: (params) => (params.data as Feature & ExpirationExtension)?.expiration,
        },
        {
          ...ColumnDefinitions.ActionsPinnedRight7,
          headerName: '',
          field: 'enabledInConfiguration',
          cellRenderer: FeaturesStatusComponent,
          cellRendererParams: (() => {
            const params: FeaturesStatusParams & IdFieldParams<Feature> = {
              isDisabled: (feature) => !feature.isConfigurable || this.disabled$.value,
              onToggle: (feature, enabled) => this.toggleFeature(feature, enabled),
              tooltipGetter: (feature: Feature) => feature.isConfigurable ? "Toggle off | default | on" : "This feature can't be configured",
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
