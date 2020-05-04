import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { AllCommunityModules, ColDef, CellClickedEvent, ValueGetterParams } from '@ag-grid-community/all-modules';
import { MatSnackBar } from '@angular/material/snack-bar';

import { App } from '../../shared/models/app.model';
import { AppsListService } from '../shared/services/apps-list.service';
import { AppsListShowComponent } from '../shared/ag-grid-components/apps-list-show/apps-list-show.component';
import { AppsListActionsComponent } from '../shared/ag-grid-components/apps-list-actions/apps-list-actions.component';
import { AppsListActionsParams } from '../shared/models/apps-list-actions-params.model';
import { appNamePattern, appNameError } from '../shared/constants/app';
import { BooleanFilterComponent } from '../../shared/components/boolean-filter/boolean-filter.component';
import { IdFieldComponent } from '../../shared/components/id-field/id-field.component';

@Component({
  selector: 'app-apps-list',
  templateUrl: './apps-list.component.html',
  styleUrls: ['./apps-list.component.scss']
})
export class AppsListComponent implements OnInit, OnDestroy {
  apps: App[];

  columnDefs: ColDef[] = [
    {
      headerName: 'ID', field: 'Id', width: 70, headerClass: 'dense', cellClass: 'id-action no-padding no-outline',
      cellRenderer: 'idFieldComponent', sortable: true, filter: 'agTextColumnFilter', valueGetter: this.idValueGetter,
    },
    {
      headerName: 'Show', field: 'IsHidden', width: 70, headerClass: 'dense', cellClass: 'icons no-outline', sortable: true,
      filter: 'booleanFilterComponent', cellRenderer: 'appsListShowComponent', valueGetter: this.showValueGetter,
    },
    {
      headerName: 'Name', field: 'Name', flex: 2, minWidth: 250, cellClass: 'primary-action highlight', sortable: true,
      filter: 'agTextColumnFilter', onCellClicked: this.openApp.bind(this),
    },
    {
      width: 40, cellClass: 'secondary-action no-padding', cellRenderer: 'appsListActionsComponent',
      cellRendererParams: {
        onDelete: this.deleteApp.bind(this),
      } as AppsListActionsParams,
    },
    {
      headerName: 'Folder', field: 'Folder', flex: 2, minWidth: 250, cellClass: 'no-outline', sortable: true,
      filter: 'agTextColumnFilter',
    },
  ];
  frameworkComponents = {
    booleanFilterComponent: BooleanFilterComponent,
    idFieldComponent: IdFieldComponent,
    appsListShowComponent: AppsListShowComponent,
    appsListActionsComponent: AppsListActionsComponent,
  };
  modules = AllCommunityModules;

  private subscription = new Subscription();
  private hasChild: boolean;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private appsListService: AppsListService,
    private snackBar: MatSnackBar,
  ) {
    this.hasChild = !!this.route.snapshot.firstChild.firstChild;
  }

  ngOnInit() {
    this.fetchAppsList();
    this.refreshOnChildClosed();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.subscription = null;
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

  private fetchAppsList() {
    this.appsListService.getAll().subscribe(apps => {
      this.apps = apps;
    });
  }

  private idValueGetter(params: ValueGetterParams) {
    const app: App = params.data;
    return `ID: ${app.Id}\nGUID: ${app.Guid}`;
  }

  private showValueGetter(params: ValueGetterParams) {
    const app: App = params.data;
    return !app.IsHidden;
  }

  private deleteApp(app: App) {
    // tslint:disable-next-line:max-line-length
    const result = prompt(`This cannot be undone. To really delete this app, type 'yes!' or type/paste the app-name here. Are you sure want to delete '${app.Name}' (${app.Id})?`);
    if (result === null) {
      return;
    } else if (result === app.Name || result === 'yes!') {
      this.snackBar.open(`Deleting...`);
      this.appsListService.delete(app.Id).subscribe(() => {
        this.snackBar.open(`Deleted`, null, { duration: 2000 });
        this.fetchAppsList();
      });
    } else {
      alert('Input did not match - will not delete');
    }
  }

  private openApp(params: CellClickedEvent) {
    const appId = (params.data as App).Id;
    this.router.navigate([appId.toString()], { relativeTo: this.route.parent });
  }

  private refreshOnChildClosed() {
    this.subscription.add(
      this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe((event: NavigationEnd) => {
        const hadChild = this.hasChild;
        this.hasChild = !!this.route.snapshot.firstChild.firstChild;
        if (!this.hasChild && hadChild) {
          this.fetchAppsList();
        }
      })
    );
  }

}
