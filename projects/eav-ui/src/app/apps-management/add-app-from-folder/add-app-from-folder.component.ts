import { GridOptions } from '@ag-grid-community/core';
import { Component, HostBinding, OnDestroy, OnInit } from "@angular/core";
import { MatDialogRef } from "@angular/material/dialog";
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, Observable, of, share, startWith, Subject, switchMap, map } from "rxjs";
import { IdFieldParams } from '../../shared/components/id-field/id-field.models';
import { defaultGridOptions } from "../../shared/constants/default-grid-options.constants";
import { PendingApp, PendingAppChecked } from "../models/app.model";
import { AppsListService } from "../services/apps-list.service";
import { AppNameShowComponent } from './app-name-show/app-name-show.component';
import { CheckboxCellComponent } from './checkbox-cell/checkbox-cell.component';
import { CheckboxCellParams } from './checkbox-cell/checkbox-cell.model';

@Component({
  selector: 'app-add-app-from-folder',
  templateUrl: './add-app-from-folder.component.html',
  styleUrls: ['./add-app-from-folder.component.scss'],
})
export class AddAppFromFolderComponent implements OnInit, OnDestroy {
  @HostBinding('className') hostClass = 'dialog-component';

  pendingApps$: Observable<PendingApp[]>;
  gridOptions = this.buildGridOptions();

  private refreshApps$ = new Subject<void>();
  pendingApps: PendingApp[] = [];

  constructor(
    private dialogRef: MatDialogRef<AddAppFromFolderComponent>,
    private appsListService: AppsListService,
    private snackBar: MatSnackBar,
  ) { }
  
  ngOnInit(): void {
    this.pendingApps$ = this.refreshApps$.pipe(
      startWith(undefined),
      switchMap(() => this.appsListService.getPendingApps().pipe(catchError(() => of(undefined)))),
      share()
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
    this.appsListService.installPendingApps(this.pendingApps).subscribe({
      error: () => {
        this.snackBar.open('Failed to install app. Please check console for more information', undefined, { duration: 3000 });
      },
      next: () => {
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
          flex: 1,
          minWidth: 200,
          cellClass: 'no-outline',
          sortable: true,
          cellRenderer: CheckboxCellComponent,
          cellRendererParams: (() => {
            const params: CheckboxCellParams = {
              onChange: (app, enabled) => this.onChange(app, enabled),
            };
            return params;
          }),
        },
        {
          field: 'Name',
          flex: 2,
          minWidth: 200,
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