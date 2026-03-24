import { GridOptions } from '@ag-grid-community/core';
import { Component, computed, effect, HostBinding, inject, signal } from "@angular/core";
import { MatButtonModule } from '@angular/material/button';
import { MatDialogActions, MatDialogRef } from "@angular/material/dialog";
import { MatSnackBar } from '@angular/material/snack-bar';
import { transient } from '../../../../../core';
import { FeatureInfoBoxComponent } from '../../features/feature-info-box/feature-info-box';
import { FeatureNames } from '../../features/feature-names';
import { FeaturesService } from '../../features/features.service';
import { ColumnDefinitions } from '../../shared/ag-grid/column-definitions';
import { IdFieldParams } from '../../shared/components/id-field/id-field.models';
import { defaultGridOptions } from "../../shared/constants/default-grid-options.constants";
import { DialogHeaderComponent } from "../../shared/dialog-header/dialog-header";
import { SxcGridModule } from '../../shared/modules/sxc-grid-module/sxc-grid.module';
import { PendingApp } from "../models/app.model";
import { AppsListService } from "../services/apps-list.service";
import { AppNameShowComponent } from './app-name-show/app-name-show';
import { CheckboxCellComponent } from './checkbox-cell/checkbox-cell';
import { CheckboxCellParams } from './checkbox-cell/checkbox-cell.model';

@Component({
  selector: 'app-add-app-from-folder',
  templateUrl: './add-app-from-folder.html',
  styleUrls: ['./add-app-from-folder.scss'],
  imports: [
    MatDialogActions,
    MatButtonModule,
    FeatureInfoBoxComponent,
    SxcGridModule,
    DialogHeaderComponent
  ]
})
export class AddAppFromFolderComponent {
  @HostBinding('className') hostClass = 'dialog-component';

  installing: boolean = false;

  public features = inject(FeaturesService);
  #isAddFromFolderEnabled = this.features.isEnabled[FeatureNames.AppSyncWithSiteFiles];
  #appsListService = transient(AppsListService);
  #pendingAppsResource = this.#appsListService.getPendingApps();
  gridOptions = this.buildGridOptions();

  AppSyncWithSiteFiles = FeatureNames.AppSyncWithSiteFiles;

  pendingApps = signal<PendingAppSelectable[]>([]);
  protected selectedAppsCount = computed(() => this.pendingApps().filter(app => app.IsSelected).length);

  constructor(
    private dialog: MatDialogRef<AddAppFromFolderComponent>,
    private snackBar: MatSnackBar,
  ) {
    effect(() => {
      const pendingApps = this.#pendingAppsResource.value() ?? [];
      this.pendingApps.set(pendingApps.map(app => ({ ...app, IsSelected: true })));
    });
  }

  closeDialog(): void {
    this.dialog.close();
  }

  onChange(app: PendingApp, enabled: boolean) {
    this.pendingApps.update(pendingApps => pendingApps.map(current =>
      this.isSamePendingApp(current, app)
        ? { ...current, IsSelected: enabled }
        : current
    ));
  }

  install(): void {
    this.installing = true;
    this.snackBar.open('Installing', undefined, { duration: 2000 });
    const selectedApps = this.pendingApps()
      .filter(app => app.IsSelected)
      .map(({ IsSelected, ...app }) => app);
    this.#appsListService.installPendingApps(selectedApps).subscribe({
      error: () => {
        this.installing = false;
        this.snackBar.open('Failed to install app. Please check console for more information', undefined, { duration: 3000 });
      },
      next: () => {
        this.installing = false;
        this.snackBar.open('Installed app', undefined, { duration: 2000 });
        this.closeDialog();
      },
    });
  }

  private buildGridOptions(): GridOptions {
    const gridOptions: GridOptions = {
      ...defaultGridOptions,
      columnDefs: [
        {
          field: 'IsSelected',
          width: 40,
          cellClass: 'no-outline',
          sortable: true,
          cellRenderer: CheckboxCellComponent,
          cellRendererParams: {
            isDisabled: !this.#isAddFromFolderEnabled(),
            onChange: (app, enabled) => this.onChange(app, enabled),
          } satisfies CheckboxCellParams,
        },
        {
          ...ColumnDefinitions.ItemsText,
          field: 'Name',
          flex: 1,
          sort: 'asc',
          cellRenderer: AppNameShowComponent,
          cellRendererParams: (() => {
            const params: IdFieldParams<PendingApp> = {
              tooltipGetter: (pendingApp) => `Server folder: ${pendingApp.ServerFolder}\nFolder: ${pendingApp.Folder}\nVersion: ${pendingApp.Version}\nDescription: ${pendingApp.Description}`,
            };
            return params;
          })(),
        },
      ]
    }
    return gridOptions;
  }

  private isSamePendingApp(left: PendingApp, right: PendingApp): boolean {
    return left.ServerFolder === right.ServerFolder && left.Folder === right.Folder;
  }
}

interface PendingAppSelectable extends PendingApp {
  IsSelected: boolean;
}

