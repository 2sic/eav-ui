import { GridOptions } from '@ag-grid-community/core';
import { Component, HostBinding, OnDestroy, OnInit } from "@angular/core";
import { MatDialogRef } from "@angular/material/dialog";
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject, catchError, distinctUntilChanged, Observable, of, share, startWith, Subject, Subscription, switchMap } from "rxjs";
import { FeatureNames } from '../../features/feature-names';
import { BaseSubsinkComponent } from '../../shared/components/base-subsink-component/base-subsink.component';
import { IdFieldParams } from '../../shared/components/id-field/id-field.models';
import { defaultGridOptions } from "../../shared/constants/default-grid-options.constants";
import { FeaturesService } from '../../shared/services/features.service';
import { PendingApp } from "../models/app.model";
import { AppsListService } from "../services/apps-list.service";
import { AppNameShowComponent } from './app-name-show/app-name-show.component';
import { CheckboxCellComponent } from './checkbox-cell/checkbox-cell.component';
import { CheckboxCellParams } from './checkbox-cell/checkbox-cell.model';

@Component({
  selector: 'app-add-app-from-folder',
  templateUrl: './add-app-from-folder.component.html',
  styleUrls: ['./add-app-from-folder.component.scss'],
})
export class AddAppFromFolderComponent extends BaseSubsinkComponent implements OnInit, OnDestroy {
  @HostBinding('className') hostClass = 'dialog-component';

  pendingApps$: Observable<PendingApp[]>;
  gridOptions = this.buildGridOptions();
  pendingApps: PendingApp[] = [];
  installing: boolean = false;

  private refreshApps$ = new Subject<void>();
  private isAddFromFolderEnabled$ = new BehaviorSubject<boolean>(false);


  constructor(
    private dialogRef: MatDialogRef<AddAppFromFolderComponent>,
    private appsListService: AppsListService,
    private snackBar: MatSnackBar,
    private featuresService: FeaturesService,
  ) { 
    super();
  }
  
  ngOnInit(): void {
    this.pendingApps$ = this.refreshApps$.pipe(
      startWith(undefined),
      switchMap(() => this.appsListService.getPendingApps().pipe(catchError(() => of(undefined)))),
      share()
    );
    this.subscription.add(this.featuresService.isEnabled$(FeatureNames.AppSyncWithSiteFiles)
      .pipe(distinctUntilChanged())
      .subscribe(this.isAddFromFolderEnabled$)
    ); 
  }

  ngOnDestroy(): void {
    this.refreshApps$.complete();
    super.ngOnDestroy();
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
              isDisabled: !this.isAddFromFolderEnabled$.value,
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