import { GridOptions } from '@ag-grid-community/core';
import { Component, OnInit, signal, ViewContainerRef } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogActions, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterOutlet } from '@angular/router';
import { convert, Of, transient } from '../../../../core';
import { ConfirmDeleteDialogComponent } from '../app-administration/sub-dialogs/confirm-delete-dialog/confirm-delete-dialog';
import { ConfirmDeleteDialogData } from '../app-administration/sub-dialogs/confirm-delete-dialog/confirm-delete-dialog.models';
import { ColumnDefinitions } from '../shared/ag-grid/column-definitions';
import { defaultGridOptions } from '../shared/constants/default-grid-options.constants';
import { eavConstants, MetadataKeyTypes } from '../shared/constants/eav.constants';
import { convertFormToUrl } from '../shared/helpers/url-prep.helper';
import { EditForm, EditPrep } from '../shared/models/edit-form.model';
import { SxcGridModule } from '../shared/modules/sxc-grid-module/sxc-grid.module';
import { DialogRoutingService } from '../shared/routing/dialog-routing.service';
import { Permission } from './models/permission.model';
import { PermissionsActionsComponent } from './permissions-actions/permissions-actions';
import { PermissionsActionsParams } from './permissions-actions/permissions-actions.models';
import { PermissionsService } from './services/permissions.service';

@Component({
  selector: 'app-permissions',
  templateUrl: './permissions.html',
  imports: [
    MatButtonModule,
    MatIconModule,
    RouterOutlet,
    MatDialogActions,
    SxcGridModule,
  ]
})
export class PermissionsComponent implements OnInit {
  gridOptions = this.buildGridOptions();
  #permissionsService = transient(PermissionsService);
  #dialogRoutes = transient(DialogRoutingService);

  #params = convert(this.#dialogRoutes.getParams(['targetType', 'keyType', 'key']), p => ({
    targetType: parseInt(p.targetType, 10),
    keyType: p.keyType as Of<typeof MetadataKeyTypes>,
    key: p.key,
  }));

  #refresh = signal<number>(0);
  permissions = this.#permissionsService.getAllLive(this.#params.targetType, this.#params.keyType, this.#params.key, this.#refresh);

  #prefills: Record<string, Record<string, string>> = {
    [eavConstants.metadata.language.targetType]: {
      PermissionType: 'language',
    },
  };

  constructor(
    private dialog: MatDialogRef<PermissionsComponent>,
    private snackBar: MatSnackBar,
    private viewContainerRef: ViewContainerRef,
    private matDialog: MatDialog,
  ) { }

  ngOnInit() {
    this.#dialogRoutes.doOnDialogClosed(() => this.#refresh.update(x => x + 1));
  }

  closeDialog() {
    this.dialog.close();
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

  #deletePermission(permission: Permission) {
    const data: ConfirmDeleteDialogData = {
      entityId: permission.Id,
      entityTitle: permission.Title,
      message: "Delete this permission?",
      hasDeleteSnackbar: true
    };
    const confirmationDialogRef = this.matDialog.open(ConfirmDeleteDialogComponent, {
      autoFocus: false,
      data,
      viewContainerRef: this.viewContainerRef,
      width: '400px',
    });
    confirmationDialogRef.afterClosed().subscribe((isConfirmed: boolean) => {
      if (isConfirmed)
        this.#permissionsService.delete(permission.Id).subscribe(() => {
          this.snackBar.open('Deleted', null, { duration: 2000 });
          this.#refresh.update(x => x + 1);
        })
    });
    return;
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
              onDelete: (permission) => this.#deletePermission(permission),
            };
            return params;
          })(),
        },
      ],
    };
    return gridOptions;
  }
}
