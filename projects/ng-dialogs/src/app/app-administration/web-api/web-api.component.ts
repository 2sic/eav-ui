import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AllCommunityModules, GridOptions } from '@ag-grid-community/all-modules';

import { WebApisService } from '../services/web-apis.service';
import { WebApi } from '../models/web-api.model';
import { WebApiActionsComponent } from '../ag-grid-components/web-api-actions/web-api-actions.component';
import { WebApiActionsParams } from '../ag-grid-components/web-api-actions/web-api-actions.models';
import { SanitizeService } from '../../../../../edit/eav-material-controls/adam/sanitize.service';
import { DialogService } from '../../shared/services/dialog.service';
import { EditForm } from '../../shared/models/edit-form.model';
import { defaultGridOptions } from '../../shared/constants/default-grid-options';

@Component({
  selector: 'app-web-api',
  templateUrl: './web-api.component.html',
  styleUrls: ['./web-api.component.scss']
})
export class WebApiComponent implements OnInit {
  webApis: WebApi[];

  modules = AllCommunityModules;
  gridOptions: GridOptions = {
    ...defaultGridOptions,
    frameworkComponents: {
      webApiActions: WebApiActionsComponent,
    },
    columnDefs: [
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
          onOpenCode: this.openCode.bind(this),
          onDelete: this.deleteApi.bind(this),
        } as WebApiActionsParams,
      },
    ],
  };

  constructor(
    private webApisService: WebApisService,
    private sanitizeService: SanitizeService,
    private snackBar: MatSnackBar,
    private dialogService: DialogService,
  ) { }

  ngOnInit() {
    this.fetchWebApis();
  }

  addController() {
    let name = prompt('Controller name:', 'TestController.cs');
    if (name === null || name.length === 0) { return; }

    name = this.sanitizeService.sanitizeName(name);
    name = name.replace(/\s/g, ''); // remove all whitespaces
    // find name without extension
    let nameLower = name.toLocaleLowerCase();
    const extIndex = nameLower.lastIndexOf('.cs');
    if (extIndex > 0) {
      nameLower = nameLower.substring(0, extIndex);
    }
    const typeIndex = nameLower.lastIndexOf('controller');
    if (typeIndex > 0) {
      nameLower = nameLower.substring(0, typeIndex);
    }
    // uppercase first letter, take other letters as is and append extension
    name = name.charAt(0).toLocaleUpperCase() + name.substring(1, nameLower.length) + 'Controller.cs';

    this.snackBar.open('Saving...');
    this.webApisService.create(name).subscribe(res => {
      this.snackBar.open('Saved', null, { duration: 2000 });
      this.fetchWebApis();
    });
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
    this.dialogService.openCodeFile(`${api.folder}/${api.name}.cs`);
  }

  private deleteApi(api: WebApi) {
    alert('Delete api');
  }

}
