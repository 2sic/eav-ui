import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { AllCommunityModules, ColDef, GridReadyEvent, GridSizeChangedEvent, CellClickedEvent } from '@ag-grid-community/all-modules';

import { App } from '../../shared/models/app.model';
import { AppsManagementDialogParamsService } from '../shared/services/apps-management-dialog-params.service';
import { AppsListService } from '../shared/services/apps-list.service';
import { AppsListShowComponent } from '../shared/ag-grid-components/apps-list-show/apps-list-show.component';
import { AppsListActionsComponent } from '../shared/ag-grid-components/apps-list-actions/apps-list-actions.component';
import { AppsListActionsParams } from '../shared/models/apps-list-actions-params.model';
import { ImportAppComponent } from '../shared/modals/import-app/import-app.component';
import { ImportAppDialogData } from '../shared/models/import-app-dialog-data.model';

@Component({
  selector: 'app-apps-list',
  templateUrl: './apps-list.component.html',
  styleUrls: ['./apps-list.component.scss']
})
export class AppsListComponent implements OnInit, OnDestroy {
  apps: App[];

  columnDefs: ColDef[] = [
    { headerName: 'Name', field: 'Name', cellClass: 'clickable', onCellClicked: this.handleNameCellClicked.bind(this) },
    { headerName: 'Folder', field: 'Folder', cellClass: 'clickable', onCellClicked: this.handleNameCellClicked.bind(this) },
    { headerName: 'Show', field: 'IsHidden', cellRenderer: 'appsListShowComponent', width: 100 },
    {
      headerName: 'Actions', cellRenderer: 'appsListActionsComponent', width: 100, cellRendererParams: <AppsListActionsParams>{
        onDelete: this.deleteApp.bind(this),
      }
    },
  ];
  frameworkComponents = {
    appsListShowComponent: AppsListShowComponent,
    appsListActionsComponent: AppsListActionsComponent,
  };
  modules = AllCommunityModules;

  private subscriptions: Subscription[] = [];
  private importAppDialogRef: MatDialogRef<ImportAppComponent, any>;

  constructor(
    private dialog: MatDialog,
    private appsManagementDialogParamsService: AppsManagementDialogParamsService,
    private appsListService: AppsListService,
  ) { }

  ngOnInit() {
    this.fetchAppsList();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => { subscription.unsubscribe(); });
    this.subscriptions = null;
    if (this.importAppDialogRef) {
      this.importAppDialogRef.close();
      this.importAppDialogRef = null;
    }
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
    const importAppDialogData: ImportAppDialogData = {
      context: this.appsManagementDialogParamsService.context,
    };
    this.importAppDialogRef = this.dialog.open(ImportAppComponent, {
      backdropClass: 'import-app-dialog-backdrop',
      panelClass: 'import-app-dialog-panel',
      data: importAppDialogData,
    });
    this.subscriptions.push(
      this.importAppDialogRef.afterClosed().subscribe(() => {
        console.log('Import app dialog was closed.');
        this.reloadApps();
      }),
    );
  }

  reloadApps() {
    this.fetchAppsList();
  }

  private handleNameCellClicked(params: CellClickedEvent) {
    const appData = <App>params.data;
    this.openApp(appData.Id);
  }

  private deleteApp(app: App) {
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
