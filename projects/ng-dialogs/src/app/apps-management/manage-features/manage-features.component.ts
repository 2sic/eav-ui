import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { BehaviorSubject, fromEvent, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { AllCommunityModules, GridOptions, ICellRendererParams, ValueGetterParams, CellClickedEvent } from '@ag-grid-community/all-modules';

import { Feature } from '../models/feature.model';
import { FeaturesListEnabledComponent } from '../ag-grid-components/features-list-enabled/features-list-enabled.component';
import { FeaturesListUiComponent } from '../ag-grid-components/features-list-ui/features-list-ui.component';
import { FeaturesListPublicComponent } from '../ag-grid-components/features-list-public/features-list-public.component';
import { FeaturesListSecurityComponent } from '../ag-grid-components/features-list-security/features-list-security.component';
import { FeaturesConfigService } from '../services/features-config.service';
import { ManageFeaturesMessageData } from '../models/manage-features-message-data.model';
import { BooleanFilterComponent } from '../../shared/components/boolean-filter/boolean-filter.component';
import { IdFieldComponent } from '../../shared/components/id-field/id-field.component';
import { defaultGridOptions } from '../../shared/constants/default-grid-options.constants';

@Component({
  selector: 'app-manage-features',
  templateUrl: './manage-features.component.html',
  styleUrls: ['./manage-features.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ManageFeaturesComponent implements OnInit, OnDestroy {
  features$ = new BehaviorSubject<Feature[]>(null);
  showManagement$ = new BehaviorSubject(false);
  showSpinner$ = new BehaviorSubject(false);
  managementUrl$ = new BehaviorSubject(this.sanitizer.bypassSecurityTrustResourceUrl(''));

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

  private managementSubscription: Subscription;

  constructor(private sanitizer: DomSanitizer, private featuresConfigService: FeaturesConfigService) { }

  ngOnInit() {
    this.fetchFeatures();
  }

  ngOnDestroy() {
    this.features$.complete();
    this.showManagement$.complete();
    this.showSpinner$.complete();
    this.managementUrl$.complete();
    this.managementSubscription?.unsubscribe();
  }

  toggleManagement() {
    this.showManagement$.next(!this.showManagement$.value);
    this.managementSubscription?.unsubscribe();
    if (this.showManagement$.value) {
      this.openManagement();
    }
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

  private openManagement() {
    this.showSpinner$.next(true);
    this.managementUrl$.next(this.sanitizer.bypassSecurityTrustResourceUrl('')); // reset url

    this.featuresConfigService.getManageFeaturesUrl().subscribe(url => {
      this.showSpinner$.next(false);

      if (url.includes('error: user needs host permissions')) {
        this.showManagement$.next(false);
        throw new Error('User needs host permissions!');
      }

      this.managementUrl$.next(this.sanitizer.bypassSecurityTrustResourceUrl(url));

      /** This should await callbacks from the iframe and if it gets a valid callback containing a json, it should send it to the server */
      this.managementSubscription = fromEvent(window, 'message').pipe(take(1)).subscribe((event: MessageEvent) => {
        if (typeof event.data === 'undefined') { return; }
        if (event.origin.endsWith('2sxc.org') === false) { return; } // something from an unknown domain, let's ignore it

        try {
          const features: ManageFeaturesMessageData = event.data;
          const featuresString = JSON.stringify(features);
          this.featuresConfigService.saveFeatures(featuresString).subscribe(res => {
            this.showManagement$.next(false);
            this.fetchFeatures();
          });
        } catch (e) { }
      });
    });
  }

}
