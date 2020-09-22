import { AllCommunityModules, CellClickedEvent, GridOptions, ICellRendererParams, ValueGetterParams } from '@ag-grid-community/all-modules';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { BehaviorSubject, Subscription } from 'rxjs';
import { filter, map, pairwise, startWith } from 'rxjs/operators';
import { ImportAppDialogData } from '../../import-app/import-app-dialog.config';
import { BooleanFilterComponent } from '../../shared/components/boolean-filter/boolean-filter.component';
import { IdFieldComponent } from '../../shared/components/id-field/id-field.component';
import { defaultGridOptions } from '../../shared/constants/default-grid-options.constants';
import { AppsListActionsComponent } from '../ag-grid-components/apps-list-actions/apps-list-actions.component';
import { AppsListActionsParams } from '../ag-grid-components/apps-list-actions/apps-list-actions.models';
import { AppsListShowComponent } from '../ag-grid-components/apps-list-show/apps-list-show.component';
import { appNameError, appNamePattern } from '../constants/app.patterns';
import { App } from '../models/app.model';
import { AppsListService } from '../services/apps-list.service';

@Component({
  selector: 'app-apps-list',
  templateUrl: './apps-list.component.html',
  styleUrls: ['./apps-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppsListComponent implements OnInit, OnDestroy {
  apps$ = new BehaviorSubject<App[]>(null);

  modules = AllCommunityModules;
  gridOptions: GridOptions = {
    ...defaultGridOptions,
    frameworkComponents: {
      booleanFilterComponent: BooleanFilterComponent,
      idFieldComponent: IdFieldComponent,
      appsListShowComponent: AppsListShowComponent,
      appsListActionsComponent: AppsListActionsComponent,
    },
    columnDefs: [
      {
        headerName: 'ID', field: 'Id', width: 70, headerClass: 'dense', cellClass: 'id-action no-padding no-outline',
        cellRenderer: 'idFieldComponent', sortable: true, filter: 'agTextColumnFilter', valueGetter: this.idValueGetter,
      },
      {
        headerName: 'Show', field: 'IsHidden', width: 70, headerClass: 'dense', cellClass: 'icons no-outline', sortable: true,
        filter: 'booleanFilterComponent', cellRenderer: 'appsListShowComponent', valueGetter: this.showValueGetter,
      },
      {
        headerName: 'Name', field: 'Name', flex: 2, minWidth: 250, cellClass: 'apps-list-primary-action highlight', sortable: true,
        filter: 'agTextColumnFilter', onCellClicked: this.openApp.bind(this), cellRenderer: (params: ICellRendererParams) => {
          const app: App = params.data;
          if (app.Thumbnail != null) {
            return `
            <div class="container">
              <img class="image logo" src="${app.Thumbnail}?w=40&h=40&mode=crop"></img>
              <div class="text">${params.value}</div>
            </div>`;
          } else {
            return `
            <div class="container">
              <div class="image logo">
                <span class="material-icons-outlined">star_border</span>
              </div>
              <div class="text">${params.value}</div>
            </div>`;
          }
        },
      },
      {
        width: 80, cellClass: 'secondary-action no-padding', cellRenderer: 'appsListActionsComponent',
        cellRendererParams: {
          onDelete: this.deleteApp.bind(this),
          onFlush: this.flushApp.bind(this),
        } as AppsListActionsParams,
      },
      {
        headerName: 'Folder', field: 'Folder', flex: 2, minWidth: 250, cellClass: 'no-outline', sortable: true,
        filter: 'agTextColumnFilter',
      },
      {
        headerName: 'Version', field: 'Version', width: 78, headerClass: 'dense', cellClass: 'no-outline', sortable: true,
        filter: 'agTextColumnFilter',
      },
      {
        headerName: 'Items', field: 'Items', width: 70, headerClass: 'dense', cellClass: 'number-cell no-outline', sortable: true,
        filter: 'agNumberColumnFilter',
      },
    ],
  };

  private subscription = new Subscription();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private appsListService: AppsListService,
    private snackBar: MatSnackBar,
  ) { }

  ngOnInit() {
    this.fetchAppsList();
    this.refreshOnChildClosed();
  }

  ngOnDestroy() {
    this.apps$.complete();
    this.subscription.unsubscribe();
  }

  browseCatalog() {
    window.open('https://2sxc.org/apps', '_blank');
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
    this.snackBar.open('Saving...');
    this.appsListService.create(name).subscribe(() => {
      this.snackBar.open('Saved', null, { duration: 2000 });
      this.fetchAppsList();
    });
  }

  importApp(files?: File[]) {
    const dialogData: ImportAppDialogData = { files };
    this.router.navigate(['import'], { relativeTo: this.route.firstChild, state: dialogData });
  }

  private fetchAppsList() {
    this.appsListService.getAll().subscribe(apps => {
      this.apps$.next(apps);
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
    const result = prompt(`This cannot be undone. To really delete this app, type 'yes!' or type/paste the app-name here. Are you sure want to delete '${app.Name}' (${app.Id})?`);
    if (result === null) { return; }
    if (result === app.Name || result === 'yes!') {
      this.snackBar.open('Deleting...');
      this.appsListService.delete(app.Id).subscribe(() => {
        this.snackBar.open('Deleted', null, { duration: 2000 });
        this.fetchAppsList();
      });
    } else {
      alert('Input did not match - will not delete');
    }
  }

  private flushApp(app: App) {
    if (!confirm(`Flush the App Cache for ${app.Name} (${app.Id})?`)) { return; }
    this.snackBar.open('Flushing cache...');
    this.appsListService.flushCache(app.Id).subscribe(() => {
      this.snackBar.open('Cache flushed', null, { duration: 2000 });
    });
  }

  private openApp(params: CellClickedEvent) {
    const appId = (params.data as App).Id;
    this.router.navigate([appId.toString()], { relativeTo: this.route.parent });
  }

  private refreshOnChildClosed() {
    this.subscription.add(
      this.router.events.pipe(
        filter(event => event instanceof NavigationEnd),
        startWith(!!this.route.snapshot.firstChild.firstChild),
        map(() => !!this.route.snapshot.firstChild.firstChild),
        pairwise(),
        filter(([hadChild, hasChild]) => hadChild && !hasChild),
      ).subscribe(() => {
        this.fetchAppsList();
      })
    );
  }

}
