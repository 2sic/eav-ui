import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { GridOptions, ModuleRegistry } from '@ag-grid-community/core';
import { NgClass } from '@angular/common';
import { ChangeDetectorRef, Component, effect, inject, linkedSignal, OnInit, signal, ViewContainerRef } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogActions } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterOutlet } from '@angular/router';
import { forkJoin, Subject, timer } from 'rxjs';
import { transient } from '../../../../../core';
import { ExpirationExtension } from '../../features/expiration-extension';
import { FeatureState } from '../../features/models';
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
    LicensesOrderPipe,
    ActiveFeaturesCountPipe,
    TippyDirective,
  ],
})
export class LicenseInfoComponent implements OnInit {

  gridOptions = this.#buildGridOptions();
  #refreshLicenses$ = new Subject<void>();

  #featuresConfigSvc = transient(FeaturesConfigService);
  #dialogRouter = transient(DialogRoutingService);
  isDebug = inject(GlobalConfigService).isDebug;
  router = inject(Router);

  #refreshLicensesSig = signal(0);

 // TODO: 2dg, ask 2dm, try to move to source
  #licensesSig = this.#featuresConfigSvc.getLicensesLive(this.#refreshLicensesSig).value;

  licensesList2 = linkedSignal<License[], License[]>({
    source: this.#licensesSig,
    computation: (licenses, previous) => {

      console.log('2dm - licenses', { licenses, previous });
      if (!licenses) {
        // TODO: don't use sub-property @2dg
        console.log("2dm: LicenseInfoComponent: No licenses found, returning empty list");
        return previous?.value ?? [];
      }
      // Map/expand wie bisher
      const expanded = licenses
        .map(l => ({
          ...ExpirationExtension.expandLicense(l),
          Features: l.Features.map(f => ExpirationExtension.expandFeature(f)),
        }));

      return expanded;
    }
  });

  constructor(
    private matDialog: MatDialog,
    private viewContainerRef: ViewContainerRef,
    private changeDetectorRef: ChangeDetectorRef,
  ) {
    ModuleRegistry.registerModules([ClientSideRowModelModule]);


    effect(() => {
      const licenses = this.#licensesSig();
      this.disabled.set(!licenses); 
    });

  }

  disabled = signal(false);


  ngOnInit(): void {
    this.#dialogRouter.doOnDialogClosedWithData((data) => {
      // Local Save, data not refreshing from Server 
      // Save the Data in Json, same als Toggle 
      if (data.objData) {
        const featuresConfig: FeatureState = {
          FeatureGuid: data.objData.guid,
          Enabled: data.objData.enabled,
          Configuration: {
            LoadAppDetails: data.objData.LoadAppDetails,
            LoadAppSummary: data.objData.LoadAppSummary,
            LoadSystemDataDetails: data.objData.LoadSystemDataDetails,
            LoadSystemDataSummary: data.objData.LoadSystemDataSummary,
          }
        }

        this.#featuresConfigSvc.saveFeatures([featuresConfig]).subscribe(() => {
          // Test, refresh Data from Server
          setTimeout(() => {
            this.#refreshLicenses$.next()
            this.#refreshLicensesSig.update(v => v++);
            this.disabled.set(false);
          }, 100)
        });

      } else { // Refresh from Server
        this.#refreshLicenses$.next()
        this.#refreshLicensesSig.update(v => v++);
        this.disabled.set(false);
      }
    });
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
        this.disabled.set(false);
        this.#refreshLicenses$.next();
      },
      next: () => {
        this.#refreshLicensesSig.set(this.#refreshLicensesSig() + 1);
        this.#refreshLicenses$.next();
        this.disabled.set(false);

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
          ...ColumnDefinitions.TextWideMin100,
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
          ...ColumnDefinitions.TextWideMin100,
          headerName: 'Name',
          field: 'name',
          cellClass: [...'primary-action highlight'.split(' '), 'no-outline'],
          onCellClicked: (params) => {
            this.#showFeatureDetails(params.data as Feature);
          },
        },
        {

          headerName: 'Enabled',
          field: 'isEnabled',
          width: 82,
          cellClass: 'no-outline',
          headerClass: 'dense',
          sortable: true,
          filter: BooleanFilterComponent,
          cellRenderer: FeaturesListEnabledComponent,
          cellRendererParams: ({
            addItemUrlTest: (ct) => this.#urlTo(`edit/${this.#routeAddItem(ct)}`),
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
          width: 80,
          tooltipValueGetter: (p) => (p.data as Feature & ExpirationExtension)?.expiration,
        },
        {
          ...ColumnDefinitions.ActionsPinnedRight6,
          cellClass: 'no-outline',
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


