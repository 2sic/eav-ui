import { GridOptions } from '@ag-grid-community/core';
import { Component, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogActions, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterOutlet } from '@angular/router';
import { convert, Of, transient } from '../core';
import { ColumnDefinitions } from '../shared/ag-grid/column-definitions';
import { defaultGridOptions } from '../shared/constants/default-grid-options.constants';
import { eavConstants, MetadataKeyTypes } from '../shared/constants/eav.constants';
import { convertFormToUrl } from '../shared/helpers/url-prep.helper';
import { EditForm, EditPrep } from '../shared/models/edit-form.model';
import { SxcGridModule } from '../shared/modules/sxc-grid-module/sxc-grid.module';
import { DialogRoutingService } from '../shared/routing/dialog-routing.service';
import { Permission } from './models/permission.model';
import { PermissionsActionsComponent } from './permissions-actions/permissions-actions.component';
import { PermissionsActionsParams } from './permissions-actions/permissions-actions.models';
import { PermissionsService } from './services/permissions.service';

@Component({
  selector: 'app-permissions',
  templateUrl: './permissions.component.html',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    RouterOutlet,
    MatDialogActions,
    SxcGridModule,
  ],
})
export class PermissionsComponent implements OnInit {
  gridOptions = this.buildGridOptions();
  permissions = signal<Permission[]>([]);
  #permissionsService = transient(PermissionsService);
  #dialogRoutes = transient(DialogRoutingService);

  #params = convert(this.#dialogRoutes.getParams(['targetType', 'keyType', 'key']), p => ({
    targetType: parseInt(p.targetType, 10),
    keyType: p.keyType as Of<typeof MetadataKeyTypes>,
    key: p.key,
  }));

  #prefills: Record<string, Record<string, string>> = {
    [eavConstants.metadata.language.targetType]: {
      PermissionType: 'language',
    },
  };

  constructor(
    private dialogRef: MatDialogRef<PermissionsComponent>,
    private snackBar: MatSnackBar,
  ) {
  }

  ngOnInit() {
    this.#fetchPermissions();
    this.#dialogRoutes.doOnDialogClosed(() => this.#fetchPermissions());
  }

  closeDialog() {
    this.dialogRef.close();
  }

  #fetchPermissions() {
    this.#permissionsService.getAll(this.#params.targetType, this.#params.keyType, this.#params.key)
      .subscribe(permissions => {
        this.permissions.set(permissions);
      });
  }

  editPermission(permission?: Permission) {
    let form: EditForm;
    if (permission == null) {
      form = {
        items: [{
          ...EditPrep.newMetadataFromInfo(
            eavConstants.contentTypes.permissions,
            EditPrep.constructMetadataInfo(this.#params.targetType, this.#params.keyType, this.#params.key)
          ),
          ...(this.#prefills[this.#params.targetType] && { Prefill: this.#prefills[this.#params.targetType] }),
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
      this.#fetchPermissions();
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
