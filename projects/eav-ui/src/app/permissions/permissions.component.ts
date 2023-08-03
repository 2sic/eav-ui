import { GridOptions } from '@ag-grid-community/core';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, Observable, combineLatest, map } from 'rxjs';
import { BaseComponent } from '../shared/components/base-component/base.component';
import { IdFieldComponent } from '../shared/components/id-field/id-field.component';
import { IdFieldParams } from '../shared/components/id-field/id-field.models';
import { defaultGridOptions } from '../shared/constants/default-grid-options.constants';
import { eavConstants, MetadataKeyType } from '../shared/constants/eav.constants';
import { convertFormToUrl } from '../shared/helpers/url-prep.helper';
import { EditForm } from '../shared/models/edit-form.model';
import { Permission } from './models/permission.model';
import { PermissionsActionsComponent } from './permissions-actions/permissions-actions.component';
import { PermissionsActionsParams } from './permissions-actions/permissions-actions.models';
import { PermissionsService } from './services/permissions.service';

@Component({
  selector: 'app-permissions',
  templateUrl: './permissions.component.html',
  styleUrls: ['./permissions.component.scss'],
})
export class PermissionsComponent extends BaseComponent implements OnInit, OnDestroy {
  permissions$ = new BehaviorSubject<Permission[]>(undefined);
  gridOptions = this.buildGridOptions();

  private targetType = parseInt(this.route.snapshot.paramMap.get('targetType'), 10);
  private keyType = this.route.snapshot.paramMap.get('keyType') as MetadataKeyType;
  private key = this.route.snapshot.paramMap.get('key');
  private prefills: Record<string, Record<string, string>> = {
    [eavConstants.metadata.language.targetType]: {
      PermissionType: 'language',
    },
  };

  viewModel$: Observable<PermissionsViewModel>;

  constructor(
    protected router: Router,
    protected route: ActivatedRoute,
    private dialogRef: MatDialogRef<PermissionsComponent>,

    private permissionsService: PermissionsService,
    private snackBar: MatSnackBar,
  ) { 
    super(router, route);
  }

  ngOnInit() {
    this.fetchPermissions();
    this.subscription.add(this.refreshOnChildClosedShallow().subscribe(() => { this.fetchPermissions(); }));
    this.viewModel$ = combineLatest([
      this.permissions$
    ]).pipe(map(([permissions]) => ({ permissions })));
  }

  ngOnDestroy() {
    this.permissions$.complete();
    super.ngOnDestroy();
  }

  closeDialog() {
    this.dialogRef.close();
  }

  private fetchPermissions() {
    this.permissionsService.getAll(this.targetType, this.keyType, this.key).subscribe(permissions => {
      this.permissions$.next(permissions);
    });
  }

  editPermission(permission?: Permission) {
    let form: EditForm;
    if (permission == null) {
      form = {
        items: [{
          ContentTypeName: eavConstants.contentTypes.permissions,
          For: {
            Target: Object.values(eavConstants.metadata).find(m => m.targetType === this.targetType)?.target ?? this.targetType.toString(),
            TargetType: this.targetType,
            ...(this.keyType === eavConstants.keyTypes.guid && { Guid: this.key }),
            ...(this.keyType === eavConstants.keyTypes.number && { Number: parseInt(this.key, 10) }),
            ...(this.keyType === eavConstants.keyTypes.string && { String: this.key }),
          },
          ...(this.prefills[this.targetType] && { Prefill: this.prefills[this.targetType] }),
        }],
      };
    } else {
      form = {
        items: [{ EntityId: permission.Id }],
      };
    }
    const formUrl = convertFormToUrl(form);
    this.router.navigate([`edit/${formUrl}`], { relativeTo: this.route });
  }

  private deletePermission(permission: Permission) {
    if (!confirm(`Delete '${permission.Title}' (${permission.Id})?`)) { return; }
    this.snackBar.open('Deleting...');
    this.permissionsService.delete(permission.Id).subscribe(() => {
      this.snackBar.open('Deleted', null, { duration: 2000 });
      this.fetchPermissions();
    });
  }

  private buildGridOptions(): GridOptions {
    const gridOptions: GridOptions = {
      ...defaultGridOptions,
      columnDefs: [
        {
          headerName: 'ID',
          field: 'Id',
          width: 70,
          headerClass: 'dense',
          cellClass: 'id-action no-padding no-outline'.split(' '),
          sortable: true,
          filter: 'agNumberColumnFilter',
          valueGetter: (params) => {
            const permission: Permission = params.data;
            return permission.Id;
          },
          cellRenderer: IdFieldComponent,
          cellRendererParams: (() => {
            const params: IdFieldParams<Permission> = {
              tooltipGetter: (permission: Permission) => `ID: ${permission.Id}\nGUID: ${permission.Guid}`,
            };
            return params;
          })(),
        },
        {
          field: 'Name',
          flex: 2,
          minWidth: 250,
          cellClass: 'primary-action highlight'.split(' '),
          sortable: true,
          sort: 'asc',
          filter: 'agTextColumnFilter',
          onCellClicked: (params) => {
            const permission: Permission = params.data;
            this.editPermission(permission);
          },
          valueGetter: (params) => {
            const permission: Permission = params.data;
            return permission.Title;
          },
        },
        {
          field: 'Identity',
          flex: 2,
          minWidth: 250,
          cellClass: 'no-outline',
          sortable: true,
          filter: 'agTextColumnFilter',
          valueGetter: (params) => {
            const permission: Permission = params.data;
            return permission.Identity;
          },
        },
        {
          field: 'Condition',
          flex: 2,
          minWidth: 250,
          cellClass: 'no-outline',
          sortable: true,
          filter: 'agTextColumnFilter',
          valueGetter: (params) => {
            const permission: Permission = params.data;
            return permission.Condition;
          },
        },
        {
          field: 'Grant',
          width: 70,
          headerClass: 'dense',
          cellClass: 'no-outline',
          sortable: true,
          filter: 'agTextColumnFilter',
          valueGetter: (params) => {
            const permission: Permission = params.data;
            return permission.Grant;
          },
        },
        {
          width: 42,
          cellClass: 'secondary-action no-padding'.split(' '),
          pinned: 'right',
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