import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AllCommunityModules, ColDef, GridReadyEvent, GridSizeChangedEvent, ICellRendererParams } from '@ag-grid-community/all-modules';

import { Feature } from '../shared/models/feature.model';
import { FeaturesListEnabledComponent } from '../shared/ag-grid-components/features-list-enabled/features-list-enabled.component';
import { FeaturesListUiComponent } from '../shared/ag-grid-components/features-list-ui/features-list-ui.component';
import { FeaturesListPublicComponent } from '../shared/ag-grid-components/features-list-public/features-list-public.component';
import { FeaturesListSecurityComponent } from '../shared/ag-grid-components/features-list-security/features-list-security.component';

@Component({
  selector: 'app-manage-features',
  templateUrl: './manage-features.component.html',
  styleUrls: ['./manage-features.component.scss']
})
export class ManageFeaturesComponent implements OnInit {
  features: Feature[];

  frameworkComponents = {
    featuresListEnabledComponent: FeaturesListEnabledComponent,
    featuresListUiComponent: FeaturesListUiComponent,
    featuresListPublicComponent: FeaturesListPublicComponent,
    featuresListSecurityComponent: FeaturesListSecurityComponent,
  };

  columnDefs: ColDef[] = [
    { headerName: 'Enabled', field: 'enabled', cellRenderer: 'featuresListEnabledComponent', width: 100 },
    {
      headerName: 'Name', field: 'id', cellRenderer: (params: ICellRendererParams) => {
        const feature: Feature = params.data;
        return `<a href="https://2sxc.org/r/f/${feature.id}" target="_blank">details</a> (name lookup still WIP)`;
      }
    },
    { headerName: 'Feature GUID', field: 'id' },
    {
      headerName: 'Expires', field: 'expires', width: 100, cellRenderer: (params: ICellRendererParams) => {
        const feature: Feature = params.data;
        return (feature.expires as Date).toLocaleDateString();
      }
    },
    { headerName: 'UI', field: 'ui', width: 100, cellRenderer: 'featuresListUiComponent' },
    { headerName: 'Public', field: 'public', width: 100, cellRenderer: 'featuresListPublicComponent' },
    { headerName: 'Security', width: 100, cellRenderer: 'featuresListSecurityComponent' },
  ];

  modules = AllCommunityModules;

  constructor(
    private http: HttpClient,
  ) { }

  ngOnInit() {
    this.fetchFeaturesList();
  }

  reloadFeatures() {
    this.fetchFeaturesList();
  }

  private fetchFeaturesList() {
    this.http.get(`/desktopmodules/2sxc/api/app-sys/system/features`)
      .subscribe((features: Feature[]) => {
        features.forEach(feature => {
          feature.expires = new Date(feature.expires);
        });
        this.features = features;
      });
  }

  onGridReady(params: GridReadyEvent) {
    params.api.sizeColumnsToFit();
  }

  onGridSizeChanged(params: GridSizeChangedEvent) {
    params.api.sizeColumnsToFit();
  }

}
