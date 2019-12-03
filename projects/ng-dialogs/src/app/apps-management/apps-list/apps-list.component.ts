import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
// tslint:disable-next-line:max-line-length
import { AllCommunityModules, ColDef, GridReadyEvent, GridSizeChangedEvent, CellClickedEvent } from '@ag-grid-community/all-modules';

import { App } from '../../shared/models/app.model';
import { AppsManagementDialogParamsService } from '../shared/apps-management-dialog-params.service';
import { AppsListShowComponent } from '../shared/ag-grid-components/apps-list-show/apps-list-show.component';
import { AppsListActionsComponent } from '../shared/ag-grid-components/apps-list-actions/apps-list-actions.component';

@Component({
  selector: 'app-apps-list',
  templateUrl: './apps-list.component.html',
  styleUrls: ['./apps-list.component.scss']
})
export class AppsListComponent implements OnInit {
  apps: App[];

  frameworkComponents = {
    appsListShowComponent: AppsListShowComponent,
    appsListActionsComponent: AppsListActionsComponent,
  };

  columnDefs: ColDef[] = [
    { headerName: 'Name', field: 'Name', cellClass: 'clickable', onCellClicked: this.handleNameCellClicked.bind(this) },
    { headerName: 'Folder', field: 'Folder', cellClass: 'clickable', onCellClicked: this.handleNameCellClicked.bind(this) },
    { headerName: 'Show', field: 'IsHidden', cellRenderer: 'appsListShowComponent' },
    {
      headerName: 'Actions', cellRenderer: 'appsListActionsComponent', cellRendererParams: {
        onDelete: this.handleDeleteClicked.bind(this)
      }
    },
  ];

  modules = AllCommunityModules;

  constructor(
    private http: HttpClient,
    private appsManagementDialogParamsService: AppsManagementDialogParamsService,
  ) { }

  ngOnInit() {
    this.fetchAppsList();
  }

  onGridReady(params: GridReadyEvent) {
    params.api.sizeColumnsToFit();
  }

  onGridSizeChanged(params: GridSizeChangedEvent) {
    params.api.sizeColumnsToFit();
  }

  browseCatalog() {
    window.open('http://2sxc.org/apps');
  }

  reloadApps() {
    this.fetchAppsList();
  }

  private handleNameCellClicked(params: CellClickedEvent) {
    const appData = <App>params.data;
    this.openApp(appData.Id);
  }

  private handleDeleteClicked(app: App) {
    // tslint:disable-next-line:max-line-length
    const result = prompt(`This cannot be undone. To really delete this app, type 'yes!' or type/paste the app-name here: sure you want to delete '${app.Name}' (${app.Id})?`); // spm Translate
    if (result === null) {
      return;
    } else if (result === app.Name || result === 'yes!') {
      // spm Move to service
      // svc.delete(app.Id);
      console.log('delete me', app);
    } else {
      alert('input did not match - will not delete'); // spm Translate
    }
  }

  private openApp(appId: number) {
    this.appsManagementDialogParamsService.openedAppId$$.next(appId);
  }

  private fetchAppsList() {
    // spm Move to service
    this.http.get(`/desktopmodules/2sxc/api/app-sys/system/apps?zoneId=${this.appsManagementDialogParamsService.context.zoneId}`)
      .subscribe((apps: App[]) => {
        this.apps = apps;
      });
  }

}
