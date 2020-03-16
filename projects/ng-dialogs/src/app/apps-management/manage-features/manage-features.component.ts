import { Component, OnInit, OnDestroy } from '@angular/core';
import { SafeUrl, DomSanitizer } from '@angular/platform-browser';
// tslint:disable-next-line:max-line-length
import { AllCommunityModules, ColDef, GridReadyEvent, GridSizeChangedEvent, ICellRendererParams, ValueGetterParams } from '@ag-grid-community/all-modules';

import { Feature } from '../shared/models/feature.model';
import { FeaturesListEnabledComponent } from '../shared/ag-grid-components/features-list-enabled/features-list-enabled.component';
import { FeaturesListUiComponent } from '../shared/ag-grid-components/features-list-ui/features-list-ui.component';
import { FeaturesListPublicComponent } from '../shared/ag-grid-components/features-list-public/features-list-public.component';
import { FeaturesListSecurityComponent } from '../shared/ag-grid-components/features-list-security/features-list-security.component';
import { FeaturesConfigService } from '../shared/services/features-config.service';
import { ElementEventListener } from '../../../../../shared/element-event-listener-model';
import { ManageFeaturesMessageData } from '../shared/models/manage-features-message-data.model';

@Component({
  selector: 'app-manage-features',
  templateUrl: './manage-features.component.html',
  styleUrls: ['./manage-features.component.scss']
})
export class ManageFeaturesComponent implements OnInit, OnDestroy {
  features: Feature[];
  showManagement = false;
  showSpinner = false;
  managementUrl: SafeUrl;
  managementListener: ElementEventListener;

  columnDefs: ColDef[] = [
    {
      headerName: 'Enabled', field: 'enabled', minWidth: 170, width: 100, sortable: true, filter: 'agTextColumnFilter',
      cellRenderer: 'featuresListEnabledComponent',
    },
    {
      headerName: 'Name', field: 'id', minWidth: 250, width: 200, sortable: true, filter: 'agTextColumnFilter',
      cellRenderer: (params: ICellRendererParams) => {
        return `<a href="https://2sxc.org/r/f/${params.value}" target="_blank">details</a> (name lookup still WIP)`;
      },
    },
    { headerName: 'Feature GUID', field: 'id', minWidth: 300, width: 200, sortable: true, filter: 'agTextColumnFilter' },
    {
      headerName: 'Expires', field: 'expires', minWidth: 200, width: 100, sortable: true, filter: 'agTextColumnFilter',
      valueGetter: this.valueGetterDateTime,
    },
    {
      headerName: 'UI', field: 'ui', minWidth: 140, width: 100, sortable: true, filter: 'agTextColumnFilter',
      cellRenderer: 'featuresListUiComponent',
    },
    {
      headerName: 'Public', field: 'public', minWidth: 160, width: 100, sortable: true, filter: 'agTextColumnFilter',
      cellRenderer: 'featuresListPublicComponent'
    },
    { headerName: 'Security', minWidth: 100, width: 100, cellRenderer: 'featuresListSecurityComponent' },
  ];
  frameworkComponents = {
    featuresListEnabledComponent: FeaturesListEnabledComponent,
    featuresListUiComponent: FeaturesListUiComponent,
    featuresListPublicComponent: FeaturesListPublicComponent,
    featuresListSecurityComponent: FeaturesListSecurityComponent,
  };
  modules = AllCommunityModules;

  constructor(private sanitizer: DomSanitizer, private featuresConfigService: FeaturesConfigService) { }

  ngOnInit() {
    this.fetchFeatures();
  }

  ngOnDestroy() {
    this.destroyManagementListener();
  }

  onGridReady(params: GridReadyEvent) {
    params.api.sizeColumnsToFit();
  }

  onGridSizeChanged(params: GridSizeChangedEvent) {
    params.api.sizeColumnsToFit();
  }

  reloadFeatures() {
    this.fetchFeatures();
  }

  toggleManagement() {
    this.showManagement = !this.showManagement;
    this.destroyManagementListener();
    if (this.showManagement) {
      this.openManagement();
    }
  }

  private fetchFeatures() {
    this.featuresConfigService.getAll().subscribe(features => {
      this.features = features;
    });
  }

  private openManagement() {
    this.showSpinner = true;
    this.managementUrl = this.sanitizer.bypassSecurityTrustResourceUrl(''); // reset url

    this.featuresConfigService.getManageFeaturesUrl().subscribe(url => {
      this.showSpinner = false;

      if (url.indexOf('error: user needs host permissions') > -1) {
        this.showManagement = false;
        throw new Error('User needs host permissions!');
      }

      this.managementUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
      const managementCallbackBound = this.managementCallback.bind(this);
      // event to receive message from iframe
      window.addEventListener('message', managementCallbackBound);
      this.managementListener = { element: window, type: 'message', listener: managementCallbackBound };
    });
  }

  /** This should await callbacks from the iframe and if it gets a valid callback containing a json, it should send it to the server */
  private managementCallback(event: MessageEvent) {
    this.destroyManagementListener();
    if (typeof (event.data) === 'undefined') { return; }
    if (event.origin.endsWith('2sxc.org') === false) { return; } // something from an unknown domain, let's ignore it

    try {
      const features = <ManageFeaturesMessageData>event.data;
      const featuresString = JSON.stringify(features);
      this.featuresConfigService.saveFeatures(featuresString).subscribe(result => {
        this.showManagement = false;
        this.fetchFeatures();
      });
    } catch (e) { }
  }

  private destroyManagementListener() {
    if (this.managementListener) {
      this.managementListener.element.removeEventListener(this.managementListener.type, this.managementListener.listener);
      this.managementListener = null;
    }
  }

  private valueGetterDateTime(params: ValueGetterParams) {
    const rawValue: string = params.data[params.colDef.field];
    if (!rawValue) { return null; }

    // remove 'Z' and replace 'T'
    return rawValue.substring(0, 19).replace('T', ' ');
  }
}
