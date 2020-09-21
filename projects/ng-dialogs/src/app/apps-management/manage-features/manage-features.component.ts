import { AllCommunityModules, CellClickedEvent, GridOptions, ICellRendererParams, ValueGetterParams } from '@ag-grid-community/all-modules';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { BehaviorSubject, combineLatest, fromEvent, Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { BooleanFilterComponent } from '../../shared/components/boolean-filter/boolean-filter.component';
import { IdFieldComponent } from '../../shared/components/id-field/id-field.component';
import { defaultGridOptions } from '../../shared/constants/default-grid-options.constants';
import { FeaturesListEnabledComponent } from '../ag-grid-components/features-list-enabled/features-list-enabled.component';
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
  changeDetection: ChangeDetectionStrategy.OnPush
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
      featuresListSecurityComponent: FeaturesListSecurityComponent,
    },
    columnDefs: [
      {
        headerName: 'ID', field: 'id', width: 70, headerClass: 'dense', cellClass: 'id-action no-padding no-outline',
        cellRenderer: 'idFieldComponent', sortable: true, filter: 'agTextColumnFilter', valueGetter: this.idValueGetter,
      },
      {
        headerName: 'Enabled', field: 'enabled', width: 80, headerClass: 'dense', cellClass: 'no-outline',
        sortable: true, filter: 'booleanFilterComponent', cellRenderer: 'featuresListEnabledComponent',
      },
      {
        headerName: 'UI', field: 'ui', width: 70, headerClass: 'dense', cellClass: 'no-outline',
        sortable: true, filter: 'booleanFilterComponent', cellRenderer: 'featuresListUiComponent',
      },
      {
        headerName: 'Public', field: 'public', width: 70, headerClass: 'dense', cellClass: 'no-outline',
        sortable: true, filter: 'booleanFilterComponent', cellRenderer: 'featuresListPublicComponent'
      },
      {
        headerName: 'Name', field: 'id', flex: 2, minWidth: 250, cellClass: 'primary-action highlight', sortable: true,
        filter: 'agTextColumnFilter', onCellClicked: this.openFeature,
        cellRenderer: (params: ICellRendererParams) => 'details (name lookup still WIP)',
      },
      {
        headerName: 'Expires', field: 'expires', flex: 1, minWidth: 200, cellClass: 'no-outline',
        sortable: true, filter: 'agTextColumnFilter', valueGetter: this.valueGetterDateTime,
      },
      { headerName: 'Security', width: 70, cellClass: 'no-outline', cellRenderer: 'featuresListSecurityComponent' },
    ],
  };

  private features$ = new BehaviorSubject<Feature[]>(null);
  private showManagement$ = new BehaviorSubject(false);
  private showSpinner$ = new BehaviorSubject(false);
  private managementUrl$ = new BehaviorSubject(this.sanitizer.bypassSecurityTrustResourceUrl(''));
  templateVars$ = combineLatest([this.features$, this.showManagement$, this.showSpinner$, this.managementUrl$]).pipe(
    map(([features, showManagement, showSpinner, managementUrl]) => ({ features, showManagement, showSpinner, managementUrl })),
  );
  private subscription = new Subscription();

  constructor(private sanitizer: DomSanitizer, private featuresConfigService: FeaturesConfigService) { }

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
    this.managementUrl$.next(this.sanitizer.bypassSecurityTrustResourceUrl('')); // reset url
    this.featuresConfigService.getManageFeaturesUrl().subscribe(url => {
      this.showSpinner$.next(false);
      if (url.includes('error: user needs host permissions')) {
        this.showManagement$.next(false);
        throw new Error('User needs host permissions!');
      }
      this.managementUrl$.next(this.sanitizer.bypassSecurityTrustResourceUrl(url));
    });
  }

  private idValueGetter(params: ValueGetterParams) {
    const feature: Feature = params.data;
    return `GUID: ${feature.id}`;
  }

  private openFeature(params: CellClickedEvent) {
    window.open(`https://2sxc.org/r/f/${params.value}`, '_blank');
  }

  private valueGetterDateTime(params: ValueGetterParams) {
    const rawValue: string = params.data[params.colDef.field];
    if (!rawValue) { return null; }
    return rawValue.substring(0, 19).replace('T', ' '); // remove 'Z' and replace 'T'
  }

  private fetchFeatures() {
    this.featuresConfigService.getAll().subscribe(features => {
      this.features$.next(features);
    });
  }

  /** Waits for a json message from the iframe and sends it to the server */
  private subscribeToMessages() {
    this.subscription.add(
      fromEvent(window, 'message').pipe(
        filter((event: MessageEvent) => this.showManagement$.value),
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
