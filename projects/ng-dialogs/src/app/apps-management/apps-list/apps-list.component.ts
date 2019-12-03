import { Component, OnInit } from '@angular/core';
import { AllCommunityModules, ColDef, GridReadyEvent, GridSizeChangedEvent, CellClickedEvent } from '@ag-grid-community/all-modules';

import { App } from '../../shared/models/app.model';
import { AppsManagementDialogParamsService } from '../shared/services/apps-management-dialog-params.service';
import { AppsListService } from '../shared/services/apps-list.service';
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
    private appsManagementDialogParamsService: AppsManagementDialogParamsService,
    private appsListService: AppsListService,
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

  createApp() {
    const name = prompt('Enter App Name (will also be used for folder)');
    if (name) {
      this.appsListService.create(this.appsManagementDialogParamsService.context.zoneId, name).subscribe(() => {
        this.fetchAppsList();
      });
    }
  }

  importApp() {
    // open modal, upload app, close modal, refresh list
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
      this.appsListService.delete(this.appsManagementDialogParamsService.context.zoneId, app.Id).subscribe(() => {
        this.fetchAppsList();
      });
    } else {
      alert('input did not match - will not delete'); // spm Translate
    }
  }

  private openApp(appId: number) {
    this.appsManagementDialogParamsService.openedAppId$$.next(appId);
  }

  private fetchAppsList() {
    this.appsListService.getAll(this.appsManagementDialogParamsService.context.zoneId).subscribe((apps: App[]) => {
      this.apps = apps;
    });
  }

}
