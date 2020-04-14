import { Component, OnInit } from '@angular/core';
import { ColDef, AllCommunityModules, ValueGetterParams } from '@ag-grid-community/all-modules';

import { WebApisService } from '../shared/services/web-apis.service';
import { WebApi } from '../shared/models/web-api.model';
import { WebApiActionsComponent } from '../shared/ag-grid-components/web-api-actions/web-api-actions.component';
import { WebApiActionsParams } from '../shared/models/web-api-actions-params';

@Component({
  selector: 'app-web-api',
  templateUrl: './web-api.component.html',
  styleUrls: ['./web-api.component.scss']
})
export class WebApiComponent implements OnInit {
  webApis: WebApi[];

  columnDefs: ColDef[] = [
    {
      headerName: 'Folder', field: 'folder', flex: 2, minWidth: 250, cellClass: 'no-outline',
      sortable: true, filter: 'agTextColumnFilter',
    },
    {
      headerName: 'Name', field: 'name', flex: 2, minWidth: 250, cellClass: 'no-outline',
      sortable: true, filter: 'agTextColumnFilter',
    },
    {
      width: 80, cellClass: 'secondary-action no-padding', cellRenderer: 'webApiActions', cellRendererParams: {
        onOpenCode: this.openCode,
        onDelete: this.deleteApi,
      } as WebApiActionsParams,
    },
  ];
  frameworkComponents = {
    webApiActions: WebApiActionsComponent,
  };
  modules = AllCommunityModules;

  constructor(private webApisService: WebApisService) { }

  ngOnInit() {
    this.fetchWebApis();
  }

  private fetchWebApis() {
    this.webApisService.getAll().subscribe(paths => {
      this.webApis = paths.map(path => {
        const splitIndex = path.lastIndexOf('/');
        const fileExtIndex = path.lastIndexOf('.');
        const folder = path.substring(0, splitIndex);
        const name = path.substring(splitIndex + 1, fileExtIndex);
        return {
          folder,
          name,
        };
      });
    });
  }

  private openCode(api: WebApi) {
    alert('Open code editor');
  }

  private deleteApi(api: WebApi) {
    alert('Delete api');
  }

}
