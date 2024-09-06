import { GridOptions } from '@ag-grid-community/core';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef, MatDialogActions } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterOutlet } from '@angular/router';
import { BehaviorSubject, Observable, combineLatest, map } from 'rxjs';
import { IdFieldComponent } from '../shared/components/id-field/id-field.component';
import { IdFieldParams } from '../shared/components/id-field/id-field.models';
import { defaultGridOptions } from '../shared/constants/default-grid-options.constants';
import { eavConstants, MetadataKeyType } from '../shared/constants/eav.constants';
import { convertFormToUrl } from '../shared/helpers/url-prep.helper';
import { EditForm, EditPrep } from '../shared/models/edit-form.model';
import { Permission } from './models/permission.model';
import { PermissionsActionsComponent } from './permissions-actions/permissions-actions.component';
import { PermissionsActionsParams } from './permissions-actions/permissions-actions.models';
import { PermissionsService } from './services/permissions.service';
import { ColumnDefinitions } from '../shared/ag-grid/column-definitions';
import { AsyncPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { SxcGridModule } from '../shared/modules/sxc-grid-module/sxc-grid.module';
import { transient } from '../core';
import { DialogRoutingService } from '../shared/routing/dialog-routing.service';
import { MetadataInfo } from '../content-items/create-metadata-dialog/create-metadata-dialog.models';

@Component({
  selector: 'app-permissions',
  templateUrl: './permissions.component.html',
  styleUrls: ['./permissions.component.scss'],
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    RouterOutlet,
    MatDialogActions,
    AsyncPipe,
    SxcGridModule,
  ],
})
export class PermissionsComponent implements OnInit, OnDestroy {
  permissions$ = new BehaviorSubject<Permission[]>(undefined);
  gridOptions = this.buildGridOptions();

  #permissionsService = transient(PermissionsService);
  #dialogRoutes = transient(DialogRoutingService);

  private targetType = parseInt(this.#dialogRoutes.snapshot.paramMap.get('targetType'), 10);
  private keyType = this.#dialogRoutes.snapshot.paramMap.get('keyType') as MetadataKeyType;
  private key = this.#dialogRoutes.snapshot.paramMap.get('key');
  private prefills: Record<string, Record<string, string>> = {
    [eavConstants.metadata.language.targetType]: {
      PermissionType: 'language',
    },
  };

  viewModel$: Observable<PermissionsViewModel>;

  constructor(
    private dialogRef: MatDialogRef<PermissionsComponent>,
    private snackBar: MatSnackBar,
  ) {
  }

  ngOnInit() {
    this.fetchPermissions();
    this.#dialogRoutes.doOnDialogClosed(() => this.fetchPermissions());
    // TODO: @2dg - this should be easy to get rid of #remove-observables
    this.viewModel$ = this.permissions$.pipe(map((permissions) => ({ permissions })));
  }

  ngOnDestroy() {
    this.permissions$.complete();
  }

  closeDialog() {
    this.dialogRef.close();
  }

  private fetchPermissions() {
    this.#permissionsService.getAll(this.targetType, this.keyType, this.key).subscribe(permissions => {
      this.permissions$.next(permissions);
    });
  }


  editPermission(permission?: Permission) {
    let form: EditForm;
    if (permission == null) {
      form = {
        items: [{
          ...EditPrep.newMetadataFromInfo(
            eavConstants.contentTypes.permissions,
            EditPrep.constructMetadataInfo(this.targetType, this.keyType, this.key)
          ),
          ...(this.prefills[this.targetType] && { Prefill: this.prefills[this.targetType] }),
        }],
      };
    } else {
      form = {
        items: [EditPrep.editId(permission.Id)],
      };
    }
    const formUrl = convertFormToUrl(form);
    this.#dialogRoutes.navRelative([`edit/${formUrl}`]);
  }

  private deletePermission(permission: Permission) {
    if (!confirm(`Delete '${permission.Title}' (${permission.Id})?`)) return;
    this.snackBar.open('Deleting...');
    this.#permissionsService.delete(permission.Id).subscribe(() => {
      this.snackBar.open('Deleted', null, { duration: 2000 });
      this.fetchPermissions();
    });
  }

  private buildGridOptions(): GridOptions {
    const gridOptions: GridOptions = {
      ...defaultGridOptions,
      columnDefs: [
        {
          ...ColumnDefinitions.Id,
          cellRendererParams: ColumnDefinitions.idFieldParamsTooltipGetter<Permission>()
        },
        {
          ...ColumnDefinitions.TextWide,
          headerName: 'Name',
          field: 'Title',
          sort: 'asc',
          onCellClicked: (params) => {
            const permission: Permission = params.data;
            this.editPermission(permission);
          },
        },
        {
          ...ColumnDefinitions.TextWide,
          field: 'Identity',
        },
        {
          ...ColumnDefinitions.TextWide,
          field: 'Condition',
        },
        {
          ...ColumnDefinitions.Character,
          field: 'Grant',
        },
        {
          ...ColumnDefinitions.ActionsPinnedRight1,
          cellRenderer: PermissionsActionsComponent,
          cellRendererParams: (() => {
            const params: PermissionsActionsParams = {
              onDelete: (permission) => this.deletePermission(permission),
            };
            return params;
          })(),
        },
      ],
    };
    return gridOptions;
  }
}

interface PermissionsViewModel {
  permissions: Permission[];
}
