import { GridOptions, ICellRendererParams } from '@ag-grid-community/core';
import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewContainerRef, computed, inject, signal } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterOutlet } from '@angular/router';
import { BehaviorSubject, catchError, combineLatest, map, Observable, of, shareReplay, startWith, Subject, switchMap, tap } from 'rxjs';
import { FeatureNames } from '../../features/feature-names';
import { BooleanFilterComponent } from '../../shared/components/boolean-filter/boolean-filter.component';
import { FileUploadDialogData } from '../../shared/components/file-upload-dialog';
import { defaultGridOptions } from '../../shared/constants/default-grid-options.constants';
import { convertFormToUrl } from '../../shared/helpers/url-prep.helper';
import { Context } from '../../shared/services/context';
import { FeaturesScopedService } from '../../features/features-scoped.service';
import { App } from '../models/app.model';
import { AppsListService } from '../services/apps-list.service';
import { AppsListActionsComponent } from './apps-list-actions/apps-list-actions.component';
import { AppsListActionsParams } from './apps-list-actions/apps-list-actions.models';
import { openFeatureDialog } from '../../features/shared/base-feature.component';
import { MatDialog, MatDialogActions } from '@angular/material/dialog';
import { AppAdminHelpers } from '../../app-administration/app-admin-helpers';
import { AppListCodeErrorIcons, AppListShowIcons } from './app-list-grid-config';
import { AgBoolIconRenderer } from '../../shared/ag-grid/apps-list-show/ag-bool-icon-renderer.component';
import { AgBoolCellIconsParams } from '../../shared/ag-grid/apps-list-show/ag-bool-icon-params';
import { MatBadgeModule } from '@angular/material/badge';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { NgClass, AsyncPipe } from '@angular/common';
import { EcoFabSpeedDialComponent, EcoFabSpeedDialTriggerComponent, EcoFabSpeedDialActionsComponent } from '@ecodev/fab-speed-dial';
import { ModuleRegistry } from '@ag-grid-community/core';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { ColumnDefinitions } from '../../shared/ag-grid/column-definitions';
import { DragAndDropDirective } from '../../shared/directives/drag-and-drop.directive';
import { SxcGridModule } from '../../shared/modules/sxc-grid-module/sxc-grid.module';
import { transient } from '../../core';
import { DialogRoutingService } from '../../shared/routing/dialog-routing.service';
import { classLog } from '../../shared/logging';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-apps-list',
  templateUrl: './apps-list.component.html',
  styleUrls: ['./apps-list.component.scss'],
  standalone: true,
  imports: [
    SxcGridModule,
    MatDialogActions,
    EcoFabSpeedDialComponent,
    NgClass,
    EcoFabSpeedDialTriggerComponent,
    MatButtonModule,
    MatIconModule,
    EcoFabSpeedDialActionsComponent,
    MatBadgeModule,
    RouterOutlet,
    DragAndDropDirective,
    // WIP 2dm - needed for the lightspeed buttons to work
  ],
})
export class AppsListComponent implements OnInit {

  log = classLog({AppsListComponent});
  fabOpen = signal(false);
  apps = signal<App[]>([]);

  gridOptions = this.buildGridOptions();

  public features = inject(FeaturesScopedService);
  protected isAddFromFolderEnabled = this.features.isEnabled[FeatureNames.AppSyncWithSiteFiles];

  #appsListSvc = transient(AppsListService);
  #dialogRouter = transient(DialogRoutingService);

  constructor(
    private snackBar: MatSnackBar,
    private context: Context,
    // Services for showing features in the menu
    private dialog: MatDialog,
    private viewContainerRef: ViewContainerRef,
    private changeDetectorRef: ChangeDetectorRef,
  ) {
    ModuleRegistry.registerModules([ClientSideRowModelModule]);
  }

  ngOnInit(): void {
    this.#loadApps();
    this.#dialogRouter.doOnDialogClosed(() =>this.#loadApps());
  }

  openChange(open: boolean): void {
    this.fabOpen.set(open);
  }

  browseCatalog(): void {
    window.open('https://2sxc.org/apps', '_blank');
  }

  createApp(): void {
    this.#dialogRouter.navParentFirstChild(['create']);
  }

  createInheritedApp(): void {
    this.#dialogRouter.navParentFirstChild(['create-inherited']);
  }

  addFromFolder(): void {
    this.#dialogRouter.navParentFirstChild(['add-app-from-folder']);
  }

  importApp(files?: File[]): void {
    const dialogData: FileUploadDialogData = { files };
    this.#dialogRouter.navParentFirstChild(['import'], { state: dialogData });
  }

  private deleteApp(app: App): void {
    const result = prompt(`This cannot be undone. To really delete this app, type 'yes!' or type/paste the app-name here. Are you sure want to delete '${app.Name}' (${app.Id})?`);
    if (result === null) return;
    if (result === app.Name || result === 'yes!') {
      this.snackBar.open('Deleting...');
      this.#appsListSvc.delete(app.Id).subscribe({
        error: () => {
          this.snackBar.open('Delete failed. Please check console for more information', undefined, { duration: 3000 });
          this.#loadApps();
        },
        next: () => {
          this.snackBar.open('Deleted', undefined, { duration: 2000 });
          this.#loadApps();
        },
      });
    } else {
      alert('Input did not match - will not delete');
    }
  }

  private flushApp(app: App): void {
    if (!confirm(`Flush the App Cache for ${app.Name} (${app.Id})?`)) return;
    this.snackBar.open('Flushing cache...');
    this.#appsListSvc.flushCache(app.Id).subscribe({
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
    this.#dialogRouter.navParentFirstChild([`${this.context.zoneId}/${app.Id}/edit/${formUrl}`]);
  }

  private openApp(app: App): void {
    this.#dialogRouter.navParentFirstChild([app.Id.toString()]);
  }

  openLightSpeedFeatInfo() {
    openFeatureDialog(this.dialog, FeatureNames.LightSpeed, this.viewContainerRef, this.changeDetectorRef);
  }

  private buildGridOptions(): GridOptions {
    const gridOptions: GridOptions = {
      ...defaultGridOptions,
      columnDefs: [
        {
          ...ColumnDefinitions.IdWithDefaultRenderer,
          cellRendererParams: ColumnDefinitions.idFieldParamsTooltipGetter<App>(),
        },
        {
          ...ColumnDefinitions.IconShow,
          cellRenderer: AgBoolIconRenderer,
          cellRendererParams: (() => ({ settings: () => AppListShowIcons }))(),
        },
        {
          ...ColumnDefinitions.TextWide,
          field: 'Name',
          cellClass: 'apps-list-primary-action highlight'.split(' '),
          sort: 'asc',
          onCellClicked: (p) => {
            const app: App = p.data;
            this.openApp(app);
          },
          cellRenderer: (p: ICellRendererParams) => {
            const app: App = p.data;
            return `
            <div class="container">
              ${app.Thumbnail
                ? `<img class="image logo" src="${app.Thumbnail}?w=40&h=40&mode=crop"></img>`
                : `<div class="image logo"><span class="material-symbols-outlined">star</span></div>`
              }
              <div class="text">${p.value}</div>
            </div>
            `;
          },
        },
        {
          ...ColumnDefinitions.TextWide,
          field: 'Folder',
        },
        {
          ...ColumnDefinitions.Character,
          field: 'Version',
          width: 78,
        },
        {
          ...ColumnDefinitions.Number,
          field: 'Items',
        },
        {
          ...ColumnDefinitions.Boolean,
          field: 'HasCodeWarnings',
          headerName: 'Code',
          filter: BooleanFilterComponent,
          cellRenderer: AgBoolIconRenderer,
          cellRendererParams: (() => ({ settings: (app) => AppListCodeErrorIcons } as AgBoolCellIconsParams<App>))(),
        },
        {
          ...ColumnDefinitions.ActionsPinnedRight3,
          cellRenderer: AppsListActionsComponent,
          cellRendererParams: {
            onOpenLightspeed: (app) => this.openLightSpeed(<App>app),
            openLightspeedFeatureInfo: () => this.openLightSpeedFeatInfo(),
            do: (verb, app) => {
              switch (verb) {
                case 'deleteApp': this.deleteApp(app); break;
                case 'flushCache': this.flushApp(app); break;
              }
            }
          } satisfies AppsListActionsParams,
        },
      ],
    };
    return gridOptions;
  }

  #loadApps(): void {
    this.#appsListSvc.getAll().subscribe(apps => {
      console.log('apps', apps);
      this.apps.set(apps);
    })
  }

}

