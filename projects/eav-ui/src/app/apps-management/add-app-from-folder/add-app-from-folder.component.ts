import { GridOptions } from '@ag-grid-community/core';
import { Component, HostBinding, WritableSignal, inject } from "@angular/core";
import { MatButtonModule } from '@angular/material/button';
import { MatDialogActions, MatDialogRef } from "@angular/material/dialog";
import { MatSnackBar } from '@angular/material/snack-bar';
import { transient } from '../../../../../core';
import { FeatureNames } from '../../features/feature-names';
import { FeatureTextInfoComponent } from '../../features/feature-text-info/feature-text-info.component';
import { FeaturesScopedService } from '../../features/features-scoped.service';
import { ColumnDefinitions } from '../../shared/ag-grid/column-definitions';
import { IdFieldParams } from '../../shared/components/id-field/id-field.models';
import { defaultGridOptions } from "../../shared/constants/default-grid-options.constants";
import { SxcGridModule } from '../../shared/modules/sxc-grid-module/sxc-grid.module';
import { PendingApp } from "../models/app.model";
import { AppsListService } from "../services/apps-list.service";
import { AppNameShowComponent } from './app-name-show/app-name-show.component';
import { CheckboxCellComponent } from './checkbox-cell/checkbox-cell.component';
import { CheckboxCellParams } from './checkbox-cell/checkbox-cell.model';

@Component({
  selector: 'app-add-app-from-folder',
  templateUrl: './add-app-from-folder.component.html',
  styleUrls: ['./add-app-from-folder.component.scss'],
  standalone: true,
  imports: [
    MatDialogActions,
    MatButtonModule,
    FeatureTextInfoComponent,
    SxcGridModule,
  ],
})
export class AddAppFromFolderComponent  {
  @HostBinding('className') hostClass = 'dialog-component';

  gridOptions = this.buildGridOptions();
  installing: boolean = false;

  public features = inject(FeaturesScopedService);
  #isAddFromFolderEnabled = this.features.isEnabled[FeatureNames.AppSyncWithSiteFiles];
  #appsListService = transient(AppsListService);

  constructor(
    private dialog: MatDialogRef<AddAppFromFolderComponent>,
    private snackBar: MatSnackBar,
  ) {}

  pendingApps = this.#appsListService.getPendingApps() as WritableSignal<PendingApp[]>;

  closeDialog(): void {
    this.dialog.close();
  }

  onChange(app: PendingApp, enabled: boolean) {
    const pendingAppsTemp = this.pendingApps();

    if (enabled)
      pendingAppsTemp.push(app);
    else
      pendingAppsTemp.splice(pendingAppsTemp.indexOf(app), 1);

    this.pendingApps.set(pendingAppsTemp);
  }

  install(): void {
    this.installing = true;
    this.snackBar.open('Installing', undefined, { duration: 2000 });
    this.#appsListService.installPendingApps(this.pendingApps()).subscribe({
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
          field: '',
          width: 40,
          cellClass: 'no-outline',
          sortable: true,
          cellRenderer: CheckboxCellComponent,
          cellRendererParams: (() => {
            const params: CheckboxCellParams = {
              isDisabled: !this.#isAddFromFolderEnabled(),
              onChange: (app, enabled) => this.onChange(app, enabled),
            };
            return params;
          }),
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
}

