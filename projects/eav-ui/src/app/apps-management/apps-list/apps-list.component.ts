import { GridOptions, ICellRendererParams } from '@ag-grid-community/core';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { BehaviorSubject, catchError, filter, map, Observable, of, pairwise, share, startWith, Subject, Subscription, switchMap } from 'rxjs';
import { BooleanFilterComponent } from '../../shared/components/boolean-filter/boolean-filter.component';
import { FileUploadDialogData } from '../../shared/components/file-upload-dialog';
import { IdFieldComponent } from '../../shared/components/id-field/id-field.component';
import { IdFieldParams } from '../../shared/components/id-field/id-field.models';
import { defaultGridOptions } from '../../shared/constants/default-grid-options.constants';
import { convertFormToUrl } from '../../shared/helpers/url-prep.helper';
import { EditForm } from '../../shared/models/edit-form.model';
import { Context } from '../../shared/services/context';
import { App } from '../models/app.model';
import { AppsListService } from '../services/apps-list.service';
import { AppsListActionsComponent } from './apps-list-actions/apps-list-actions.component';
import { AppsListActionsParams } from './apps-list-actions/apps-list-actions.models';
import { AppsListShowComponent } from './apps-list-show/apps-list-show.component';

@Component({
  selector: 'app-apps-list',
  templateUrl: './apps-list.component.html',
  styleUrls: ['./apps-list.component.scss'],
})
export class AppsListComponent implements OnInit, OnDestroy {
  apps$: Observable<App[]>;
  fabOpen$ = new BehaviorSubject(false);
  gridOptions = this.buildGridOptions();

  private refreshApps$ = new Subject<void>();
  private subscription = new Subscription();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private appsListService: AppsListService,
    private snackBar: MatSnackBar,
    private context: Context,
  ) { }

  ngOnInit(): void {
    this.apps$ = this.refreshApps$.pipe(
      startWith(undefined),
      switchMap(() => this.appsListService.getAll().pipe(catchError(() => of(undefined)))),
      share(),
    );
    this.refreshOnChildClosed();
  }

  ngOnDestroy(): void {
    this.fabOpen$.complete();
    this.refreshApps$.complete();
    this.subscription.unsubscribe();
  }

  openChange(open: boolean): void {
    this.fabOpen$.next(open);
  }

  browseCatalog(): void {
    window.open('https://2sxc.org/apps', '_blank');
  }

  createApp(): void {
    this.router.navigate(['create'], { relativeTo: this.route.firstChild });
  }

  createInheritedApp(): void {
    this.router.navigate(['create-inherited'], { relativeTo: this.route.firstChild });
  }

  importApp(files?: File[]): void {
    const dialogData: FileUploadDialogData = { files };
    this.router.navigate(['import'], { relativeTo: this.route.firstChild, state: dialogData });
  }

  private deleteApp(app: App): void {
    const result = prompt(`This cannot be undone. To really delete this app, type 'yes!' or type/paste the app-name here. Are you sure want to delete '${app.Name}' (${app.Id})?`);
    if (result === null) { return; }
    if (result === app.Name || result === 'yes!') {
      this.snackBar.open('Deleting...');
      this.appsListService.delete(app.Id).subscribe({
        error: () => {
          this.snackBar.open('Delete failed. Please check console for more information', undefined, { duration: 3000 });
          this.refreshApps$.next();
        },
        next: () => {
          this.snackBar.open('Deleted', undefined, { duration: 2000 });
          this.refreshApps$.next();
        },
      });
    } else {
      alert('Input did not match - will not delete');
    }
  }

  private flushApp(app: App): void {
    if (!confirm(`Flush the App Cache for ${app.Name} (${app.Id})?`)) { return; }
    this.snackBar.open('Flushing cache...');
    this.appsListService.flushCache(app.Id).subscribe({
      error: () => {
        this.snackBar.open('Cache flush failed. Please check console for more information', undefined, { duration: 3000 });
      },
      next: () => {
        this.snackBar.open('Cache flushed', undefined, { duration: 2000 });
      },
    });
  }

  private openLightspeed(app: App): void {
    if (!app.Lightspeed) { return; }
    const form: EditForm = { items: [{ EntityId: app.Lightspeed.Id }] };
    const formUrl = convertFormToUrl(form);
    this.router.navigate([`${this.context.zoneId}/${app.Id}/edit/${formUrl}`], { relativeTo: this.route.firstChild });
  }

  private openApp(app: App): void {
    this.router.navigate([app.Id.toString()], { relativeTo: this.route.firstChild });
  }

  private refreshOnChildClosed(): void {
    this.subscription.add(
      this.router.events.pipe(
        filter(event => event instanceof NavigationEnd),
        startWith(!!this.route.snapshot.firstChild.firstChild),
        map(() => !!this.route.snapshot.firstChild.firstChild),
        pairwise(),
        filter(([hadChild, hasChild]) => hadChild && !hasChild),
      ).subscribe(() => {
        this.refreshApps$.next();
      })
    );
  }

  private buildGridOptions(): GridOptions {
    const gridOptions: GridOptions = {
      ...defaultGridOptions,
      columnDefs: [
        {
          headerName: 'ID',
          field: 'Id',
          width: 70,
          headerClass: 'dense',
          cellClass: 'id-action no-padding no-outline'.split(' '),
          sortable: true,
          filter: 'agNumberColumnFilter',
          valueGetter: (params) => {
            const app: App = params.data;
            return app.Id;
          },
          cellRenderer: IdFieldComponent,
          cellRendererParams: (() => {
            const params: IdFieldParams<App> = {
              tooltipGetter: (app) => `ID: ${app.Id}\nGUID: ${app.Guid}`,
            };
            return params;
          })(),
        },
        {
          field: 'Show',
          width: 70,
          headerClass: 'dense',
          cellClass: 'icons no-outline'.split(' '),
          sortable: true,
          filter: BooleanFilterComponent,
          valueGetter: (params) => {
            const app: App = params.data;
            return !app.IsHidden;
          },
          cellRenderer: AppsListShowComponent,
        },
        {
          field: 'Name',
          flex: 2,
          minWidth: 250,
          cellClass: 'apps-list-primary-action highlight'.split(' '),
          sortable: true,
          sort: 'asc',
          filter: 'agTextColumnFilter',
          valueGetter: (params) => {
            const app: App = params.data;
            return app.Name;
          },
          onCellClicked: (params) => {
            const app: App = params.data;
            this.openApp(app);
          },
          cellRenderer: (params: ICellRendererParams) => {
            const app: App = params.data;
            return `
            <div class="container">
              ${app.Thumbnail
                ? `<img class="image logo" src="${app.Thumbnail}?w=40&h=40&mode=crop"></img>`
                : `<div class="image logo"><span class="material-icons-outlined">star_border</span></div>`
              }
              <div class="text">${params.value}</div>
            </div>
            `;
          },
        },
        {
          field: 'Folder',
          flex: 2,
          minWidth: 250,
          cellClass: 'no-outline',
          sortable: true,
          filter: 'agTextColumnFilter',
          valueGetter: (params) => {
            const app: App = params.data;
            return app.Folder;
          },
        },
        {
          field: 'Version',
          width: 78,
          headerClass: 'dense',
          cellClass: 'no-outline',
          sortable: true,
          filter: 'agTextColumnFilter',
          valueGetter: (params) => {
            const app: App = params.data;
            return app.Version;
          },
        },
        {
          field: 'Items',
          width: 70,
          headerClass: 'dense',
          cellClass: 'number-cell no-outline'.split(' '),
          sortable: true,
          filter: 'agNumberColumnFilter',
          valueGetter: (params) => {
            const app: App = params.data;
            return app.Items;
          },
        },
        {
          width: 122,
          cellClass: 'secondary-action no-padding'.split(' '),
          pinned: 'right',
          cellRenderer: AppsListActionsComponent,
          cellRendererParams: (() => {
            const params: AppsListActionsParams = {
              onDelete: (app) => this.deleteApp(app),
              onFlush: (app) => this.flushApp(app),
              onOpenLightspeed: (app) => this.openLightspeed(app),
            };
            return params;
          })(),
        },
      ],
    };
    return gridOptions;
  }
}
