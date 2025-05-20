import { AgGridAngular } from '@ag-grid-community/angular';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { GridOptions, ModuleRegistry } from '@ag-grid-community/core';
import { AsyncPipe, NgClass } from '@angular/common';
import { ChangeDetectorRef, Component, computed, inject, OnInit, signal, ViewChild, ViewContainerRef } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogActions } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterOutlet } from '@angular/router';
import { catchError, forkJoin, map, Observable, of, share, startWith, Subject, switchMap, tap, timer } from 'rxjs';
import { transient } from '../../../../../core';
import { ExpirationExtension } from '../../features/expiration-extension';
import { FeatureConfig, FeatureState } from '../../features/models';
import { Feature } from '../../features/models/feature.model';
import { ColumnDefinitions } from '../../shared/ag-grid/column-definitions';
import { BooleanFilterComponent } from '../../shared/components/boolean-filter/boolean-filter.component';
import { IdFieldComponent } from '../../shared/components/id-field/id-field.component';
import { IdFieldParams } from '../../shared/components/id-field/id-field.models';
import { defaultGridOptions } from '../../shared/constants/default-grid-options.constants';
import { TippyDirective } from '../../shared/directives/tippy.directive';
import { convertFormToUrl } from '../../shared/helpers/url-prep.helper';
import { EditForm, EditPrep } from '../../shared/models/edit-form.model';
import { SxcGridModule } from '../../shared/modules/sxc-grid-module/sxc-grid.module';
import { DialogRoutingService } from '../../shared/routing/dialog-routing.service';
import { GlobalConfigService } from '../../shared/services/global-config.service';
import { License } from '../models/license.model';
import { FeaturesConfigService } from '../services/features-config.service';
import { ActiveFeaturesCountPipe } from './active-features-count.pipe';
import { AgGridHeightDirective } from './ag-grid-height.directive';
import { FeatureDetailsDialogComponent } from './feature-details-dialog/feature-details-dialog.component';
import { FeatureDetailsDialogData } from './feature-details-dialog/feature-details-dialog.models';
import { FeaturesListEnabledReasonComponent } from './features-list-enabled-reason/features-list-enabled-reason.component';
import { FeaturesListEnabledComponent } from './features-list-enabled/features-list-enabled.component';
import { FeaturesStatusComponent } from './features-status/features-status.component';
import { FeaturesStatusParams } from './features-status/features-status.models';
import { LicensesOrderPipe } from './licenses-order.pipe';

@Component({
  selector: 'app-license-info',
  templateUrl: './license-info.component.html',
  styleUrls: ['./license-info.component.scss'],
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
export class LicenseInfoComponent implements OnInit {
  @ViewChild(AgGridAngular) private gridRef?: AgGridAngular;

  gridOptions = this.#buildGridOptions();
  #refreshLicenses$ = new Subject<void>();
  viewModel$: Observable<LicenseInfoViewModel>;

  #featuresConfigSvc = transient(FeaturesConfigService);
  #dialogRouter = transient(DialogRoutingService);
  isDebug = inject(GlobalConfigService).isDebug;
  router = inject(Router);

  constructor(
    private matDialog: MatDialog,
    private viewContainerRef: ViewContainerRef,
    private changeDetectorRef: ChangeDetectorRef,
  ) {
    ModuleRegistry.registerModules([ClientSideRowModelModule]);
  }

  disabled = signal(false);
  #refreshLicensesSig = signal(0);

  licensesSig = computed(() => {
    const refreshState = this.#refreshLicensesSig();
    this.disabled.set(false);
    return this.#featuresConfigSvc.getLicensesSig();

  });
  // TODO: @2dg, ask 2dm licensesSig refresh is false
  // licensesSignal = this.#featuresConfigSvc.getLicensesSig(); // Holt das Signal, nicht den Wert

  // licensesSig2 = computed(() => {
  //   const refreshState = this.#refreshLicensesSig(); // Ein Refresh-Mechanismus
  //   const licenses = this.licensesSignal(); // Holt die Liste der Lizenzen (License[]), nicht das Signal selbst

  //   this.disabled.set(false);

  //   // Überprüfen, ob Lizenzen vorhanden sind, bevor sie erweitert werden
  //   if (licenses) {
  //     return licenses.map(l => ({
  //       ...ExpirationExtension.expandLicense(l), // Lizenz erweitern
  //       Features: l.Features.map((f: Feature) => ExpirationExtension.expandFeature(f)), // Features erweitern
  //     }));
  //   }

  //   // Fallback, falls keine Lizenzen vorhanden sind
  //   return [];
  // });


  ngOnInit(): void {
    // @2dg - old
    // this.#dialogRouter.doOnDialogClosed(() => {
    //   this.#refreshLicenses$.next()
    //   this.#refreshLicensesSig.set(this.#refreshLicensesSig() + 1);
    // });

    this.#dialogRouter.doOnDialogClosedWithData((data) => {
      // Local Save, data not refreshing from Server 
      // Save the Data in Json, same als Toggle 
      if (data.objData) {
        const featuresConfig: FeatureConfig = {
          FeatureGuid: data.objData.guid,
          Configuration: {
            LoadAppDetails: data.objData.LoadAppDetails,
            LoadAppSummary: data.objData.LoadAppSummary,
            LoadSystemDataDetails: data.objData.LoadSystemDataDetails,
            LoadSystemDataSummary: data.objData.LoadSystemDataSummary,
          }
        }

        this.#featuresConfigSvc.saveConfigs([featuresConfig]).subscribe({});

      } else { // Refresh from Server
        this.#refreshLicenses$.next()
        this.#refreshLicensesSig.set(this.#refreshLicensesSig() + 1);
      }
    });

    this.viewModel$ =
      this.#refreshLicenses$.pipe(
        startWith(undefined),
        switchMap(() => this.#featuresConfigSvc.getLicenses().pipe(catchError(() => of(undefined)))), // Use new http Signals
        tap(() => {
          this.disabled.set(false);
        }),

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

  trackLicenses(index: number, license: License): string {
    return license.Guid;
  }


  openRegistration(): void {
    const router = this.#dialogRouter.router;
    router.navigate([router.url.replace('license', '') + "/registration"]);
  }

  #showFeatureDetails(feature: Feature): void {
    const data: FeatureDetailsDialogData = {
      feature,
      showGuid: true,
      showStatus: true,
    };
    this.matDialog.open(FeatureDetailsDialogComponent, {
      autoFocus: false,
      data,
      viewContainerRef: this.viewContainerRef,
      width: '600px',
    });
    this.changeDetectorRef.markForCheck();
  }

  #toggleFeature(feature: Feature, enabled: boolean): void {
    this.disabled.set(true);
    const state: FeatureState = {
      FeatureGuid: feature.guid,
      Enabled: enabled,
    };
    forkJoin([this.#featuresConfigSvc.saveFeatures([state]), timer(100)]).subscribe({
      error: () => {
        this.#refreshLicensesSig.set(this.#refreshLicensesSig() + 1);
        this.#refreshLicenses$.next();
      },
      next: () => {
        this.#refreshLicensesSig.set(this.#refreshLicensesSig() + 1);
        this.#refreshLicenses$.next();
      },
    });
  }

  #urlTo(url: string) {
    return '#' + this.#dialogRouter.urlSubRoute(url);
  }

  #routeAddItem(contentType: Feature): string {
    return convertFormToUrl({
      items: [EditPrep.newFromType(contentType.configurationContentType)],
    } satisfies EditForm);
  }

  // Note: @SDV
  // I think this should serve as a good example of how to use the grid
  // 1. eg. with cellDefaults and similar initial objects containing most commonly used options here
  // 2. Also we should probably never add a valueGetter for the simple properties
  // ...not sure why it's even in here, my guess is copy-paste of code which wasn't understood properly
  // 3. I think the header-name should always be the first line, then the field
  #buildGridOptions(): GridOptions {
    const gridOptions: GridOptions = {
      ...defaultGridOptions,
      columnDefs: [
        {
          ...ColumnDefinitions.ItemsText,
          headerName: 'ID',
          field: 'nameId',
          width: 200,
          cellClass: 'no-outline',
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
          headerName: 'Name',
          field: 'name',
          cellClass: 'primary-action highlight'.split(' '),
          onCellClicked: (params) => {
            this.#showFeatureDetails(params.data as Feature);
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
          cellRendererParams: ({
            addItemUrlTest: (ct) => this.#urlTo(`edit/${this.#routeAddItem(ct)}`),
            overrideContents: [
              { LoadAppDetails: true },
            ],
          } satisfies FeaturesListEnabledComponent["params"]),
        },
        {
          ...ColumnDefinitions.TextNarrow,
          headerName: 'Reason',
          field: 'enabledReason',
          cellRenderer: FeaturesListEnabledReasonComponent,
        },
        {
          ...ColumnDefinitions.ItemsText,
          headerName: 'Expiration',
          field: 'ExpMessage',
          sortable: false,
          width: 120,
          tooltipValueGetter: (p) => (p.data as Feature & ExpirationExtension)?.expiration,
        },
        {
          ...ColumnDefinitions.ActionsPinnedRight7,
          headerName: '',
          field: 'enabledInConfiguration',
          cellRenderer: FeaturesStatusComponent,
          cellRendererParams: (() => {
            const params: FeaturesStatusParams & IdFieldParams<Feature> = {
              isDisabled: (feature) => !feature.isConfigurable || this.disabled(),
              onToggle: (feature, enabled) => this.#toggleFeature(feature, enabled),
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


