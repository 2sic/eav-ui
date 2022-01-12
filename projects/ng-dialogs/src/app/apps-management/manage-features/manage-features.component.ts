import { AllCommunityModules, GridOptions } from '@ag-grid-community/all-modules';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, combineLatest, fromEvent, Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { BooleanFilterComponent } from '../../shared/components/boolean-filter/boolean-filter.component';
import { IdFieldComponent } from '../../shared/components/id-field/id-field.component';
import { IdFieldParams } from '../../shared/components/id-field/id-field.models';
import { defaultGridOptions } from '../../shared/constants/default-grid-options.constants';
import { FeaturesListEnabledComponent } from '../ag-grid-components/features-list-enabled/features-list-enabled.component';
import { FeaturesListNameComponent } from '../ag-grid-components/features-list-name/features-list-name.component';
import { FeaturesListPublicComponent } from '../ag-grid-components/features-list-public/features-list-public.component';
import { FeaturesListSecurityComponent } from '../ag-grid-components/features-list-security/features-list-security.component';
import { FeaturesListUiComponent } from '../ag-grid-components/features-list-ui/features-list-ui.component';
import { Feature } from '../models/feature.model';
import { ManageFeaturesMessageData } from '../models/manage-features-message-data.model';
import { FeaturesConfigService } from '../services/features-config.service';

@Component({
  selector: 'app-manage-features',
  templateUrl: './manage-features.component.html',
  styleUrls: ['./manage-features.component.scss'],
})
export class ManageFeaturesComponent implements OnInit, OnDestroy {
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
      featuresListSecurityComponent: FeaturesListSecurityComponent,
    },
    columnDefs: [
      {
        field: 'ID', width: 70, headerClass: 'dense', cellClass: 'id-action no-padding no-outline',
        cellRenderer: 'idFieldComponent', sortable: true, filter: 'agTextColumnFilter',
        valueGetter: (params) => (params.data as Feature).Guid,
        cellRendererParams: {
          tooltipGetter: (feature: Feature) => `NameId: ${feature.NameId}\nGUID: ${feature.Guid}`,
        } as IdFieldParams,
      },
      {
        field: 'Enabled', width: 80, headerClass: 'dense', cellClass: 'no-outline',
        sortable: true, filter: 'booleanFilterComponent', cellRenderer: 'featuresListEnabledComponent',
        valueGetter: (params) => (params.data as Feature).Enabled,
      },
      {
        field: 'UI', width: 70, headerClass: 'dense', cellClass: 'no-outline',
        sortable: true, filter: 'booleanFilterComponent', cellRenderer: 'featuresListUiComponent',
        valueGetter: (params) => (params.data as Feature).Ui,
      },
      {
        field: 'Public', width: 70, headerClass: 'dense', cellClass: 'no-outline',
        sortable: true, filter: 'booleanFilterComponent', cellRenderer: 'featuresListPublicComponent',
        valueGetter: (params) => (params.data as Feature).Public,
      },
      {
        field: 'Name', flex: 2, minWidth: 250, cellClass: 'primary-action highlight', sortable: true,
        filter: 'agTextColumnFilter', cellRenderer: 'featuresListNameComponent',
        onCellClicked: (params) => this.openFeature(params.data),
        valueGetter: (params) => (params.data as Feature).Name,
      },
      {
        field: 'Expires', flex: 1, minWidth: 200, cellClass: 'no-outline',
        sortable: true, filter: 'agTextColumnFilter',
        valueGetter: (params) => (params.data as Feature).Expires?.replace('T', ' ').replace('Z', ''),
      },
      {
        field: 'Security', width: 80, cellClass: 'no-outline', cellRenderer: 'featuresListSecurityComponent',
        sortable: true, filter: 'agNumberColumnFilter',
        valueGetter: (params) => (params.data as Feature).Security.Impact,
      },
    ],
  };

  private features$ = new BehaviorSubject<Feature[]>(null);
  private showManagement$ = new BehaviorSubject(false);
  private showSpinner$ = new BehaviorSubject(false);
  private managementUrl$ = new BehaviorSubject<string>(null);
  templateVars$ = combineLatest([this.features$, this.showManagement$, this.showSpinner$, this.managementUrl$]).pipe(
    map(([features, showManagement, showSpinner, managementUrl]) => ({ features, showManagement, showSpinner, managementUrl })),
  );
  private subscription = new Subscription();

  constructor(private featuresConfigService: FeaturesConfigService) { }

  ngOnInit() {
    this.fetchFeatures();
    this.subscribeToMessages();
  }

  ngOnDestroy() {
    this.features$.complete();
    this.showManagement$.complete();
    this.showSpinner$.complete();
    this.managementUrl$.complete();
    this.subscription.unsubscribe();
  }

  toggleManagement() {
    this.showManagement$.next(!this.showManagement$.value);
    if (!this.showManagement$.value) { return; }

    this.showSpinner$.next(true);
    this.managementUrl$.next(null); // reset url
    this.featuresConfigService.getManageFeaturesUrl().subscribe(url => {
      this.showSpinner$.next(false);
      if (url.includes('error: user needs host permissions')) {
        this.showManagement$.next(false);
        throw new Error('User needs host permissions!');
      }
      this.managementUrl$.next(url);
    });
  }

  private openFeature(feature: Feature) {
    window.open(`https://2sxc.org/r/f/${feature.Guid}`, '_blank');
  }

  private fetchFeatures() {
    this.featuresConfigService.getAll().subscribe(features => {
      this.features$.next(features);
    });
  }

  /** Waits for a json message from the iframe and sends it to the server */
  private subscribeToMessages() {
    this.subscription.add(
      fromEvent<MessageEvent>(window, 'message').pipe(
        filter(() => this.showManagement$.value),
        filter(event => event.origin.endsWith('2sxc.org') === true),
        filter(event => event.data != null),
      ).subscribe(event => {
        const features: ManageFeaturesMessageData = event.data;
        const featuresString = JSON.stringify(features);
        this.featuresConfigService.saveFeatures(featuresString).subscribe(res => {
          this.showManagement$.next(false);
          this.fetchFeatures();
        });
      })
    );
  }
}
