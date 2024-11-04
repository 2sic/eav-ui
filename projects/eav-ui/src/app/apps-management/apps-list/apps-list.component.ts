import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { GridOptions, ICellRendererParams, ModuleRegistry } from '@ag-grid-community/core';
import { NgClass } from '@angular/common';
import { ChangeDetectorRef, Component, computed, inject, OnInit, signal, ViewContainerRef } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogActions } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { EcoFabSpeedDialActionsComponent, EcoFabSpeedDialComponent, EcoFabSpeedDialTriggerComponent } from '@ecodev/fab-speed-dial';
import { transient } from '../../../../../core';
import { AppAdminHelpers } from '../../app-administration/app-admin-helpers';
import { FeatureNames } from '../../features/feature-names';
import { FeaturesScopedService } from '../../features/features-scoped.service';
import { openFeatureDialog } from '../../features/shared/base-feature.component';
import { AgBoolCellIconsParams } from '../../shared/ag-grid/apps-list-show/ag-bool-icon-params';
import { AgBoolIconRenderer } from '../../shared/ag-grid/apps-list-show/ag-bool-icon-renderer.component';
import { ColumnDefinitions } from '../../shared/ag-grid/column-definitions';
import { BooleanFilterComponent } from '../../shared/components/boolean-filter/boolean-filter.component';
import { FileUploadDialogData } from '../../shared/components/file-upload-dialog';
import { defaultGridOptions } from '../../shared/constants/default-grid-options.constants';
import { DragAndDropDirective } from '../../shared/directives/drag-and-drop.directive';
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

  log = classLog({ AppsListComponent });

  gridOptions = this.#buildGridOptions();

  public features = inject(FeaturesScopedService);
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
    private router: Router,
    private route: ActivatedRoute
  ) {
    ModuleRegistry.registerModules([ClientSideRowModelModule]);
  }

  fabOpen = signal(false);

  #refresh = signal(0);

  apps = computed(() => {
    const refresh = this.#refresh();
    return this.#appsListSvc.getAll();
  });


  ngOnInit(): void {
    this.#dialogRouter.doOnDialogClosed(() => this.#loadApps());
  }

  openChange(open: boolean): void {
    this.fabOpen.set(open);
  }

  // TODO: @2dg - try to fix this so the link is directly in the HTML without a function call
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

  #flushApp(app: App): void {
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

  #openLightSpeed(app: App): void {
    const formUrl = convertFormToUrl(AppAdminHelpers.getLightSpeedEditParams(app.Id));
    this.#dialogRouter.navParentFirstChild([`${this.context.zoneId}/${app.Id}/edit/${formUrl}`]);
  }

  // TODO: @2dg - try to change this so the table has a link - resulting in ctrl+click opening the app in a new window...
  // #openApp(app: App): void {
  //   this.#dialogRouter.navParentFirstChild([app.Id.toString()]);
  // }

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
          cellRenderer: AgBoolIconRenderer,
          cellRendererParams: { settings: () => AppListShowIcons },
        },
        {
          ...ColumnDefinitions.TextWide,
          field: 'Name',
          cellClass: 'apps-list-primary-action highlight'.split(' '),
          sort: 'asc',
          cellRenderer: (p: ICellRendererParams) => {
            const app: App = p.data;
            const l = window.location;
            const linkUrl = `${l.origin}${l.pathname}${l.search}${l.hash}/${app.Id}`;
            return `
              <div class="container">
                ${app.Thumbnail
                ? `<img class="image logo" src="${app.Thumbnail}?w=40&h=40&mode=crop"></img>`
                : `<div class="image logo"><span class="material-symbols-outlined">star</span></div>`
              }
                <a class="default-link" href="${linkUrl}">${p.value}</a>
              </div>
            `;
          },
          // TODO: @2dg First Try, remove later
          // cellRendererFramework: RouterLinkRendererComponent,
          // cellRendererParams: (x: ICellRendererParams) => ({
          //   url: x.data.Id,
          //   name: x.value,
          //   showThumbnail: true,
          //   thumbnail: x.data.Thumbnail,
          // }),
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
            onOpenLightspeed: (app) => this.#openLightSpeed(<App>app),
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
    this.#refresh.update(value => value + 1);
  }

}

