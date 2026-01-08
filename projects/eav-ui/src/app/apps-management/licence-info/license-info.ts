import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { GridOptions, ModuleRegistry } from '@ag-grid-community/core';
import { NgClass } from '@angular/common';
import { ChangeDetectorRef, Component, effect, inject, linkedSignal, OnInit, signal, ViewChild, ViewContainerRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogActions } from '@angular/material/dialog';
import { MatAccordion, MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterOutlet } from '@angular/router';
import { forkJoin } from 'rxjs';
import { transient } from '../../../../../core';
import { ExpirationExtension } from '../../features/expiration-extension';
import { FeatureState } from '../../features/models';
import { Feature } from '../../features/models/feature.model';
import { ColumnDefinitions } from '../../shared/ag-grid/column-definitions';
import { BooleanFilterComponent } from '../../shared/components/boolean-filter/boolean-filter';
import { IdFieldComponent } from '../../shared/components/id-field/id-field';
import { IdFieldParams } from '../../shared/components/id-field/id-field.models';
import { defaultGridOptions } from '../../shared/constants/default-grid-options.constants';
import { TippyDirective } from '../../shared/directives/tippy.directive';
import { convertFormToUrl } from '../../shared/helpers/url-prep.helper';
import { EditForm } from '../../shared/models/edit-form.model';
import { ItemIdHelper } from '../../shared/models/item-id-helper';
import { SxcGridModule } from '../../shared/modules/sxc-grid-module/sxc-grid.module';
import { DialogRoutingService } from '../../shared/routing/dialog-routing.service';
import { GlobalConfigService } from '../../shared/services/global-config.service';
import { License } from '../models/license.model';
import { FeaturesConfigService } from '../services/features-config.service';
import { ActiveFeaturesCountPipe } from './active-features-count.pipe';
import { AgGridHeightDirective } from './ag-grid-height.directive';
import { FeatureDetailsDialogComponent } from './feature-details-dialog/feature-details-dialog';
import { FeatureDetailsDialogData } from './feature-details-dialog/feature-details-dialog.models';
import { FeaturesListEnabledReasonComponent } from './features-list-enabled-reason/features-list-enabled-reason';
import { FeaturesListEnabledComponent } from './features-list-enabled/features-list-enabled';
import { FeaturesStatusComponent } from './features-status/features-status';
import { FeaturesStatusParams } from './features-status/features-status.models';
import { LicensesOrderPipe } from './licenses-order.pipe';

@Component({
  selector: 'app-license-info',
  templateUrl: './license-info.html',
  styleUrls: ['./license-info.scss'],
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
    FormsModule,
    MatFormFieldModule,
    MatInputModule
  ],
})
export class LicenseInfoComponent implements OnInit {
  gridOptions = this.#buildGridOptions();

  #featuresConfigSvc = transient(FeaturesConfigService);
  #dialogRouter = transient(DialogRoutingService);
  isDebug = inject(GlobalConfigService).isDebug;
  router = inject(Router);

  #disabled = signal(false);
  #refresh = signal(0);
  #currentFilter = signal('');

  @ViewChild(MatAccordion) accordion: MatAccordion;

  licenses = linkedSignal<License[], License[]>({
    source: this.#featuresConfigSvc.getLicensesLive(this.#refresh).value,
    computation: (licenses, previous) => {
      if (!licenses)
        return previous?.value ?? [];

      // Map/expand wie bisher
      const expanded = licenses
        .map(l => ({
          ...ExpirationExtension.expandLicense(l),
          Features: l.Features.map(f => ExpirationExtension.expandFeature(f)),
          filteredFeatures: l.Features.map(f => ExpirationExtension.expandFeature(f)) // Initialize filteredFeatures with all features
        }));
      return expanded;
    }
  });

  // Initialize empty filteredLicenses - initial values will be set in constructor
  filteredLicenses = signal<License[]>(null);

  constructor(
    private matDialog: MatDialog,
    private viewContainerRef: ViewContainerRef,
    private changeDetectorRef: ChangeDetectorRef,
  ) {
    ModuleRegistry.registerModules([ClientSideRowModelModule]);

    // Create an effect to update filteredLicenses whenever licenses changes
    effect(() => {
      // Apply the current filter to the updated licenses
      this.applyFilter();
    });
  }

  ngOnInit(): void {
    this.#dialogRouter.doOnDialogClosedWithData((data) => {
      // Local Save, data not refreshing from Server 
      // Save the Data in Json, same als Toggle 

      if (data?.objData) {
        const { guid, enabled, ...dynamicConfig } = data.objData;

        const featuresConfig: FeatureState = {
          FeatureGuid: guid,
          Enabled: enabled,
          Configuration: dynamicConfig
        };

        this.#featuresConfigSvc.saveFeatures([featuresConfig]).subscribe(() => {
          this.#refreshFn(100);    // Test, refresh Data from Server
        });
        //
      } else { // Refresh from Server
        this.#refreshFn(0);
      }
    });
  }

  #refreshFn(timer?: number): void {
    setTimeout(() => {
      this.#refresh.update(v => ++v);
      this.#disabled.set(false);
    }, timer);
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
    this.#disabled.set(true);
    const state: FeatureState = {
      FeatureGuid: feature.guid,
      Enabled: enabled,
    };
    forkJoin([this.#featuresConfigSvc.saveFeatures([state])]).subscribe({
      next: () => this.#refreshFn(100),
      error: () => this.#refreshFn(100)
    });
  }

  filterLicenses(event: Event): void {
    const input = event.target as HTMLInputElement;
    const filterValue = input.value.toLowerCase();

    // Update the current filter value
    this.#currentFilter.set(filterValue);

    if(!filterValue)
      this.closeAllPanels();
    
    // Apply the filter
    this.applyFilter();
  }

  // Separate method to apply the filter
  private applyFilter(): void {
    const allLicenses = this.licenses();
    const filterValue = this.#currentFilter();

    if (!filterValue) {
      // When no filter, show all licenses with all features
      const licensesWithAllFeatures = allLicenses.map(license => ({
        ...license,
        filteredFeatures: license.Features
      }));
      this.filteredLicenses.set(licensesWithAllFeatures);
      return;
    }

    this.openAllPanels();

    // Filter licenses, but also filter features within each license
    const filtered = allLicenses.map(license => {
      // Filter features that match the search criteria
      const filteredFeatures = license.Features.filter(feature =>
        feature.name.toLowerCase().includes(filterValue) ||
        feature.nameId.toLowerCase().includes(filterValue)
      );

      // Create a new license object with filtered features
      return {
        ...license,
        filteredFeatures
      };
    });

    // Only keep licenses that either match the filter themselves or have matching features
    this.filteredLicenses.set(filtered.filter(license =>
      license.Name.toLowerCase().includes(filterValue) ||
      license.filteredFeatures.length > 0
    ));
  }

  openAllPanels() {
    if (this.accordion)
      this.accordion.openAll();
  }

  closeAllPanels() {
    if (this.accordion)
      this.accordion.closeAll();
  }

  #urlTo(url: string) {
    return '#' + this.#dialogRouter.urlSubRoute(url);
  }

  #routeAddItem(contentType: Feature, data: unknown): string {
    return convertFormToUrl({
      items: [ItemIdHelper.newJsonFromType(contentType.configurationContentType, data)],
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
            getSettingsUrl: (ct, data) => this.#urlTo(`edit/${this.#routeAddItem(ct, data)}`),
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
              isDisabled: (feature) => !feature.isConfigurable || this.#disabled(),
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