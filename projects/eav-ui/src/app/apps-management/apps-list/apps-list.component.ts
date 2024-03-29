import { GridOptions, ICellRendererParams } from '@ag-grid-community/core';
import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewContainerRef } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { BehaviorSubject, catchError, combineLatest, map, Observable, of, share, shareReplay, startWith, Subject, switchMap } from 'rxjs';
import { FeatureNames } from '../../features/feature-names';
import { BaseComponent } from '../../shared/components/base-component/base.component';
import { BooleanFilterComponent } from '../../shared/components/boolean-filter/boolean-filter.component';
import { FileUploadDialogData } from '../../shared/components/file-upload-dialog';
import { IdFieldComponent } from '../../shared/components/id-field/id-field.component';
import { IdFieldParams } from '../../shared/components/id-field/id-field.models';
import { defaultGridOptions } from '../../shared/constants/default-grid-options.constants';
import { convertFormToUrl } from '../../shared/helpers/url-prep.helper';
import { Context } from '../../shared/services/context';
import { FeaturesService } from '../../shared/services/features.service';
import { App } from '../models/app.model';
import { AppsListService } from '../services/apps-list.service';
import { AppsListActionsComponent } from './apps-list-actions/apps-list-actions.component';
import { AppsListActionsParams } from './apps-list-actions/apps-list-actions.models';
import { FeatureComponentBase } from '../../features/shared/base-feature.component';
import { MatDialog, MatDialogActions } from '@angular/material/dialog';
import { AppAdminHelpers } from '../../app-administration/app-admin-helpers';
import { AppListCodeErrorIcons, AppListShowIcons } from './app-list-grid-config';
import { AgBoolIconRenderer } from '../../shared/ag-grid/apps-list-show/ag-bool-icon-renderer.component';
import { AgBoolCellIconsParams } from '../../shared/ag-grid/apps-list-show/ag-bool-icon-params';
import { EavLogger } from '../../shared/logging/eav-logger';
import { MatBadgeModule } from '@angular/material/badge';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { NgClass, AsyncPipe } from '@angular/common';
import { EcoFabSpeedDialComponent, EcoFabSpeedDialTriggerComponent, EcoFabSpeedDialActionsComponent } from '@ecodev/fab-speed-dial';
import { SharedComponentsModule } from '../../shared/shared-components.module';
import { AgGridModule } from '@ag-grid-community/angular';
import { AppDialogConfigService } from '../../app-administration/services';
import { ModuleRegistry } from '@ag-grid-community/core';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';

const logThis = false;

@Component({
  selector: 'app-apps-list',
  templateUrl: './apps-list.component.html',
  styleUrls: ['./apps-list.component.scss'],
  standalone: true,
  imports: [
    AgGridModule,
    SharedComponentsModule,
    MatDialogActions,
    EcoFabSpeedDialComponent,
    NgClass,
    EcoFabSpeedDialTriggerComponent,
    MatButtonModule,
    MatIconModule,
    EcoFabSpeedDialActionsComponent,
    MatBadgeModule,
    RouterOutlet,
    AsyncPipe,
  ],
  providers: [
    AppsListService,
    FeaturesService,
    AppDialogConfigService,
  ],
})
export class AppsListComponent extends BaseComponent implements OnInit, OnDestroy {
  apps$: Observable<App[]>;
  fabOpen$ = new BehaviorSubject(false);
  gridOptions = this.buildGridOptions();
  isAddFromFolderEnabled$: Observable<boolean>;
  lightspeedEnabled$ = new BehaviorSubject<boolean>(false);

  private refreshApps$ = new Subject<void>();

  viewModel$: Observable<AppsListViewModel>;

  constructor(
    protected router: Router,
    protected route: ActivatedRoute,
    private appsListService: AppsListService,
    private snackBar: MatSnackBar,
    private context: Context,
    // Services for showing features in the menu
    private featuresService: FeaturesService,
    private dialog: MatDialog,
    private viewContainerRef: ViewContainerRef,
    private changeDetectorRef: ChangeDetectorRef,
    appDialogConfigService: AppDialogConfigService
  ) {
    super(router, route, new EavLogger('AppsListComponent', logThis));
    ModuleRegistry.registerModules([ ClientSideRowModelModule ]);
  }

  ngOnInit(): void {
    const appsLog = this.log.rxTap('apps$');
    this.apps$ = this.refreshApps$.pipe(
      appsLog.pipe(),
      startWith(undefined),
      switchMap(() => this.appsListService.getAll().pipe(catchError(() => of(undefined)))),
      shareReplay(1),
      appsLog.shareReplay(),
    );

    this.subscription.add(this.refreshOnChildClosedShallow().subscribe(() => { this.refreshApps$.next(); }));

    const isAddFromFolderEnabledLog = this.log.rxTap('isAddFromFolderEnabled$');
    this.isAddFromFolderEnabled$ = this.featuresService
      .isEnabled$(FeatureNames.AppSyncWithSiteFiles)
      .pipe(isAddFromFolderEnabledLog.pipe(), isAddFromFolderEnabledLog.shareReplay());
    this.subscription.add(this.featuresService.isEnabled$(FeatureNames.LightSpeed).subscribe(this.lightspeedEnabled$));
    this.viewModel$ = combineLatest([this.apps$, this.fabOpen$, this.isAddFromFolderEnabled$]).pipe(
      map(([apps, fabOpen, isAddFromFolderEnabled]) => {
        return { apps, fabOpen, isAddFromFolderEnabled};
      }),
    );
  }

  ngOnDestroy(): void {
    this.fabOpen$.complete();
    this.refreshApps$.complete();
    super.ngOnDestroy();
  }

  openChange(open: boolean): void {
    this.fabOpen$.next(open);
  }

  browseCatalog(): void {
    window.open('https://2sxc.org/apps', '_blank');
  }

  createApp(): void {
    this.router.navigate(['create'], { relativeTo: this.route.parent.firstChild });
  }

  createInheritedApp(): void {
    this.router.navigate(['create-inherited'], { relativeTo: this.route.parent.firstChild });
  }

  addFromFolder(): void {
    this.router.navigate(['add-app-from-folder'], { relativeTo: this.route.parent.firstChild });
  }

  importApp(files?: File[]): void {
    const dialogData: FileUploadDialogData = { files };
    this.router.navigate(['import'], { relativeTo: this.route.parent.firstChild, state: dialogData });
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

  private openLightSpeed(app: App): void {
    const formUrl = convertFormToUrl(AppAdminHelpers.getLightSpeedEditParams(app.Id));
    this.router.navigate([`${this.context.zoneId}/${app.Id}/edit/${formUrl}`], { relativeTo: this.route.parent.firstChild });
  }

  private openApp(app: App): void {
    this.router.navigate([app.Id.toString()], { relativeTo: this.route.parent.firstChild });
  }

  openLightSpeedFeatInfo() {
    FeatureComponentBase.openDialog(this.dialog, FeatureNames.LightSpeed, this.viewContainerRef, this.changeDetectorRef);
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
          cellRenderer: AgBoolIconRenderer,
          cellRendererParams: (() => ({ settings: () => AppListShowIcons }))(),
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
          field: 'HasCodeWarnings',
          headerName: 'Code',
          width: 70,
          headerClass: 'dense',
          cellClass: 'icons no-outline'.split(' '),
          sortable: true,
          filter: BooleanFilterComponent,
          cellRenderer: AgBoolIconRenderer,
          cellRendererParams: (() => ({ settings: (app) => AppListCodeErrorIcons } as AgBoolCellIconsParams<App>))(),
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
              onOpenLightspeed: (app) => this.openLightSpeed(app),
              lightspeedEnabled: () => this.lightspeedEnabled$.value,
              openLightspeedFeatureInfo: () => this.openLightSpeedFeatInfo(),
            };
            return params;
          })(),
        },
      ],
    };
    return gridOptions;
  }
}

interface AppsListViewModel {
  apps: App[];
  fabOpen: any;
  isAddFromFolderEnabled: boolean;
}
