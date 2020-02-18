import { Component, OnInit } from '@angular/core';
import { ColDef, AllCommunityModules, GridReadyEvent, GridSizeChangedEvent } from '@ag-grid-community/all-modules';

import { WebApisService } from '../shared/services/web-apis.service';

@Component({
  selector: 'app-web-api',
  templateUrl: './web-api.component.html',
  styleUrls: ['./web-api.component.scss']
})
export class WebApiComponent implements OnInit {
  webApis: { name: string }[];

  columnDefs: ColDef[] = [
    { headerName: 'The following list shows the .cs files in the App-API folder:', field: 'name' },
  ];
  frameworkComponents = {
  };
  modules = AllCommunityModules;

  constructor(private webApisService: WebApisService) { }

  ngOnInit() {
    this.fetchWebApis();
  }

  onGridReady(params: GridReadyEvent) {
    params.api.sizeColumnsToFit();
  }

  onGridSizeChanged(params: GridSizeChangedEvent) {
    params.api.sizeColumnsToFit();
  }

  fetchWebApis() {
    this.webApisService.getAll().subscribe(paths => {
      this.webApis = paths.map(path => {
        return { name: path };
      });
    });
  }
}
