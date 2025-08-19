import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { GridOptions, ICellRendererParams, ModuleRegistry } from '@ag-grid-community/core';
import { NgClass } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit, signal, ViewContainerRef } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogActions } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterOutlet } from '@angular/router';
import { EcoFabSpeedDialActionsComponent, EcoFabSpeedDialComponent, EcoFabSpeedDialTriggerComponent } from '@ecodev/fab-speed-dial';
import { transient } from '../../../../../core';
import { AppAdminHelpers } from '../../app-administration/app-admin-helpers';
import { FeatureNames } from '../../features/feature-names';
import { FeaturesService } from '../../features/features.service';
import { openFeatureDialog } from '../../features/shared/base-feature.component';
import { AgBoolCellIconsParams } from '../../shared/ag-grid/apps-list-show/ag-bool-icon-params';
import { AgBoolIconRenderer } from '../../shared/ag-grid/apps-list-show/ag-bool-icon-renderer.component';
import { ColumnDefinitions } from '../../shared/ag-grid/column-definitions';
import { BooleanFilterComponent } from '../../shared/components/boolean-filter/boolean-filter.component';
import { FileUploadDialogData } from '../../shared/components/file-upload-dialog';
import { defaultGridOptions } from '../../shared/constants/default-grid-options.constants';
import { DragAndDropDirective } from '../../shared/directives/drag-and-drop.directive';
import { MatBadgeIconDirective } from '../../shared/directives/mat-badge-icon.directive';
import { convertFormToUrl } from '../../shared/helpers/url-prep.helper';
import { classLog } from '../../shared/logging';
import { SxcGridModule } from '../../shared/modules/sxc-grid-module/sxc-grid.module';
import { DialogRoutingService } from '../../shared/routing/dialog-routing.service';
import { Context } from '../../shared/services/context';
import { App } from '../models/app.model';
import { AppsListService } from '../services/apps-list.service';
import { AppListCodeErrorIcons, AppListShowIcons } from './app-list-grid-config';
import { AppsListActionsComponent } from './apps-list-actions/apps-list-actions.component';
import { AppsListActionsParams } from './apps-list-actions/apps-list-actions.models';

@Component({
  selector: 'app-apps-list',
  templateUrl: './apps-list.component.html',
  styleUrls: ['./apps-list.component.scss'],
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
    MatBadgeIconDirective,
    RouterOutlet,
    DragAndDropDirective,
  ]
})
export class AppsListComponent implements OnInit {

  log = classLog({ AppsListComponent });

  gridOptions = this.#buildGridOptions();

  public features = inject(FeaturesService);
  protected isAddFromFolderEnabled = this.features.isEnabled[FeatureNames.AppSyncWithSiteFiles];

  #appsListSvc = transient(AppsListService);
  #dialogRouter = transient(DialogRoutingService);

  constructor(
    private snackBar: MatSnackBar,
    private context: Context,
    // Services for showing features in the menu
    private matDialog: MatDialog,
    private viewContainerRef: ViewContainerRef,
    private changeDetectorRef: ChangeDetectorRef,
  ) {
    ModuleRegistry.registerModules([ClientSideRowModelModule]);
  }

  fabOpen = signal(false);

  #refresh = signal(0);


  // TODO: @2dg Only for example - remove later
  //   apps = computed(() => {
  //   const refresh = this.#refresh();
  //   return this.#appsListSvc.getAllOld();
  // });

  // TODO: @2dg Only for example - remove later
  // apps = computed(() => {
  //   const refresh = this.#refresh();
  //   return untracked(() => this.#appsListSvc.getAll().value) // Untracked to avoid re-running this when the refresh changes
  // });

  apps = this.#appsListSvc.getAllLive(this.#refresh).value;


  ngOnInit(): void {
    this.#dialogRouter.doOnDialogClosed(() => this.#loadApps());
  }

  openChange(open: boolean): void {
    this.fabOpen.set(open);
  }

  browseCatalog(): void {
    window.open('https://2sxc.org/apps', '_blank');
  }

  createApp(): void {
    this.#dialogRouter.navRelative(['create']);
  }

  createInheritedApp(): void {
    this.#dialogRouter.navRelative(['create-inherited']);
  }

  addFromFolder(): void {
    this.#dialogRouter.navRelative(['add-app-from-folder']);
  }

  importApp(files?: File[]): void {
    this.#dialogRouter.navRelative(['import'], { state: { files } satisfies FileUploadDialogData });
  }

  #deleteApp(app: App): void {
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

  async #flushApp(app: App) {
    if (!confirm(`Flush the App Cache for ${app.Name} (${app.Id})?`))
      return;
    this.snackBar.open('Flushing cache...');
    try {
      const status = await this.#appsListSvc.flushCache(app.Id);
      // Check the status code
      if (status >= 200 && status < 300) {
        this.snackBar.open('Cache flushed', undefined, { duration: 2000 })
      }
    } catch (statusCode) {
      this.snackBar.open('Cache flush failed. Please check console.', undefined, { duration: 3000 }),
        console.error('Export error:', statusCode);
    }
  }


  #getLightSpeedLink(app?: App): string {
    const formUrl = convertFormToUrl(AppAdminHelpers.getLightSpeedEditParams(app.Id));
    const urlString = `${this.context.zoneId}/${app.Id}/edit/${formUrl}`;
    return this.#dialogRouter.urlSubRoute(urlString);
  }

  openLightSpeedFeatInfo() {
    openFeatureDialog(this.matDialog, FeatureNames.LightSpeed, this.viewContainerRef, this.changeDetectorRef);
  }

  #buildGridOptions(): GridOptions {
    const gridOptions: GridOptions = {
      ...defaultGridOptions,
      columnDefs: [
        {
          ...ColumnDefinitions.IdWithDefaultRenderer,
          cellRendererParams: ColumnDefinitions.idFieldParamsTooltipGetter<App>(),
        },
        {
          ...ColumnDefinitions.IconShow,
          cellRendererParams: { settings: () => AppListShowIcons },
        },
        {
          ...ColumnDefinitions.TextWide,
          field: 'Name',
          cellClass: 'apps-list-primary-action highlight'.split(' '),
          sort: 'asc',
          cellRenderer: (p: ICellRendererParams & { data: App }) => {
            const app = p.data;
            const url = this.#dialogRouter.urlSubRoute(app.Id.toString());
            return `
              <a class="default-link fill-cell" href="#${url}">
                <div class="container">
                  ${app.Thumbnail
                ? `<img class="image logo" src="${app.Thumbnail}?w=40&h=40&mode=crop"></img>`
                : `<div class="image logo"><span class="material-symbols-outlined">star</span></div>`
              }
                  ${p.value}
                </div>
              </a>
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
          cellRendererParams: (() => ({ settings: () => AppListCodeErrorIcons } as AgBoolCellIconsParams<App>))(),
        },
        {
          ...ColumnDefinitions.ActionsPinnedRight3,
          cellRenderer: AppsListActionsComponent,
          cellRendererParams: {
            lightSpeedLink: (app: App) => this.#getLightSpeedLink(app),
            openLightspeedFeatureInfo: () => this.openLightSpeedFeatInfo(),
            do: (verb, app) => {
              switch (verb) {
                case 'deleteApp': this.#deleteApp(app); break;
                case 'flushCache': this.#flushApp(app); break;
              }
            }
          } satisfies AppsListActionsParams,
        },
      ],
    };
    return gridOptions;
  }

  #loadApps(): void {
    this.#refresh.update(v => ++v);
  }

}

