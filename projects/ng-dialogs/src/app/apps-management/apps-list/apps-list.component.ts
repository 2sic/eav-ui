import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { AllCommunityModules, ColDef, GridReadyEvent, GridSizeChangedEvent, CellClickedEvent } from '@ag-grid-community/all-modules';

import { App } from '../../shared/models/app.model';
import { AppsListService } from '../shared/services/apps-list.service';
import { AppsListShowComponent } from '../shared/ag-grid-components/apps-list-show/apps-list-show.component';
import { AppsListActionsComponent } from '../shared/ag-grid-components/apps-list-actions/apps-list-actions.component';
import { AppsListActionsParams } from '../shared/models/apps-list-actions-params.model';
import { IMPORT_APP_DIALOG } from '../../shared/constants/dialog-names';
import { DialogService } from '../../shared/components/dialog-service/dialog.service';
import { appNamePattern, appNameError } from '../shared/constants/app';
import { BooleanFilterComponent } from '../../shared/components/boolean-filter/boolean-filter.component';

@Component({
  selector: 'app-apps-list',
  templateUrl: './apps-list.component.html',
  styleUrls: ['./apps-list.component.scss']
})
export class AppsListComponent implements OnInit, OnDestroy {
  apps: App[];

  columnDefs: ColDef[] = [
    {
      headerName: 'Name', field: 'Name', minWidth: 250, width: 200, cellClass: 'clickable', sortable: true,
      filter: 'agTextColumnFilter', onCellClicked: this.openApp.bind(this),
    },
    {
      headerName: 'Folder', field: 'Folder', minWidth: 250, width: 200, cellClass: 'clickable', sortable: true,
      filter: 'agTextColumnFilter', onCellClicked: this.openApp.bind(this),
    },
    {
      headerName: 'Hidden', field: 'IsHidden', minWidth: 170, width: 100, sortable: true, filter: 'booleanFilterComponent',
      cellRenderer: 'appsListShowComponent',
    },
    {
      headerName: 'Actions', minWidth: 100, width: 100, cellRenderer: 'appsListActionsComponent',
      cellRendererParams: <AppsListActionsParams>{
        onDelete: this.deleteApp.bind(this),
      },
    },
  ];
  frameworkComponents = {
    booleanFilterComponent: BooleanFilterComponent,
    appsListShowComponent: AppsListShowComponent,
    appsListActionsComponent: AppsListActionsComponent,
  };
  modules = AllCommunityModules;

  private subscription = new Subscription();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private appsListService: AppsListService,
    private dialogService: DialogService,
  ) { }

  ngOnInit() {
    this.fetchAppsList();

    this.subscription.add(
      this.dialogService.subToClosed([IMPORT_APP_DIALOG]).subscribe(closedDialog => {
        console.log('Dialog closed event captured:', closedDialog);
        this.fetchAppsList();
      })
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.subscription = null;
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
    let name = prompt('Enter App Name (will also be used for folder)');
    if (name === null) { return; }
    name = name.trim().replace(/\s\s+/g, ' '); // remove multiple white spaces and tabs
    while (!name.match(appNamePattern)) {
      name = prompt(`Enter App Name (will also be used for folder)\n${appNameError}`, name);
      if (name === null) { return; }
      name = name.trim().replace(/\s\s+/g, ' '); // remove multiple white spaces and tabs
    }
    this.appsListService.create(name).subscribe(() => {
      this.fetchAppsList();
    });
  }

  importApp() {
    this.router.navigate(['import'], { relativeTo: this.route.firstChild });
  }

  fetchAppsList() {
    this.appsListService.getAll().subscribe(apps => {
      this.apps = apps;
    });
  }

  private deleteApp(app: App) {
    // tslint:disable-next-line:max-line-length
    const result = prompt(`This cannot be undone. To really delete this app, type 'yes!' or type/paste the app-name here. Are you sure want to delete '${app.Name}' (${app.Id})?`);
    if (result === null) {
      return;
    } else if (result === app.Name || result === 'yes!') {
      this.appsListService.delete(app.Id).subscribe(() => {
        this.fetchAppsList();
      });
    } else {
      alert('Input did not match - will not delete');
    }
  }

  private openApp(params: CellClickedEvent) {
    const appId = (<App>params.data).Id;
    this.router.navigate([appId.toString()], { relativeTo: this.route.parent });
  }

}
