import { GridOptions } from '@ag-grid-community/core';
import { Component, HostBinding, OnDestroy, OnInit, inject } from "@angular/core";
import { MatDialogRef, MatDialogActions } from "@angular/material/dialog";
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, map, Observable, of, share, startWith, Subject, switchMap } from "rxjs";
import { FeatureNames } from '../../features/feature-names';
import { IdFieldParams } from '../../shared/components/id-field/id-field.models';
import { defaultGridOptions } from "../../shared/constants/default-grid-options.constants";
import { FeaturesScopedService } from '../../features/features-scoped.service';
import { PendingApp } from "../models/app.model";
import { AppsListService } from "../services/apps-list.service";
import { AppNameShowComponent } from './app-name-show/app-name-show.component';
import { CheckboxCellComponent } from './checkbox-cell/checkbox-cell.component';
import { CheckboxCellParams } from './checkbox-cell/checkbox-cell.model';
import { AsyncPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { FeatureTextInfoComponent } from '../../features/feature-text-info/feature-text-info.component';
import { SxcGridModule } from '../../shared/modules/sxc-grid-module/sxc-grid.module';
import { transient } from '../../core';

@Component({
  selector: 'app-add-app-from-folder',
  templateUrl: './add-app-from-folder.component.html',
  styleUrls: ['./add-app-from-folder.component.scss'],
  standalone: true,
  imports: [
    MatDialogActions,
    MatButtonModule,
    AsyncPipe,
    FeatureTextInfoComponent,
    SxcGridModule,
  ],
})
export class AddAppFromFolderComponent  implements OnInit, OnDestroy {
  @HostBinding('className') hostClass = 'dialog-component';

  gridOptions = this.buildGridOptions();
  pendingApps: PendingApp[] = [];
  installing: boolean = false;

  private refreshApps$ = new Subject<void>();

  viewModel$: Observable<AddAppFromFolderViewModel>;

  public features = inject(FeaturesScopedService);
  private isAddFromFolderEnabled = this.features.isEnabled(FeatureNames.AppSyncWithSiteFiles);
  private appsListService = transient(AppsListService);

  constructor(
    private dialogRef: MatDialogRef<AddAppFromFolderComponent>,
    private snackBar: MatSnackBar,
  ) {
  }

  ngOnInit(): void {
    // TODO: @2dg - this should be easy to get rid of #remove-observables
    this.viewModel$ =  this.refreshApps$.pipe(
      startWith(undefined),
      switchMap(() => this.appsListService.getPendingApps().pipe(catchError(() => of(undefined)))),
      share(),
      map((pendingApps) => ({ pendingApps })),
    );
  }

  ngOnDestroy(): void {
    this.refreshApps$.complete();
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  onChange(app: PendingApp, enabled: boolean) {
    if (enabled)
      this.pendingApps.push(app);
    else
      this.pendingApps.splice(this.pendingApps.indexOf(app), 1);
  }

  install(): void {
    this.installing = true;
    this.snackBar.open('Installing', undefined, { duration: 2000 });
    this.appsListService.installPendingApps(this.pendingApps).subscribe({
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
              isDisabled: !this.isAddFromFolderEnabled,
              onChange: (app, enabled) => this.onChange(app, enabled),
            };
            return params;
          }),
        },
        {
          field: 'Name',
          flex: 1,
          cellClass: 'no-outline',
          sortable: true,
          sort: 'asc',
          filter: 'agTextColumnFilter',
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

interface AddAppFromFolderViewModel {
  pendingApps: PendingApp[];
}
