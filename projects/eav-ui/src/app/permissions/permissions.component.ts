import { GridOptions } from '@ag-grid-community/core';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef, MatDialogActions } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { BehaviorSubject, Observable, combineLatest, map } from 'rxjs';
import { BaseWithChildDialogComponent } from '../shared/components/base-component/base-with-child-dialog.component';
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
import { ColumnDefinitions } from '../shared/ag-grid/column-definitions';
import { AsyncPipe } from '@angular/common';
import { AgGridModule } from '@ag-grid-community/angular';
import { MatIconModule } from '@angular/material/icon';
import { SharedComponentsModule } from '../shared/shared-components.module';
import { MatButtonModule } from '@angular/material/button';
import { MetadataService } from './services/metadata.service';
import { EntitiesService } from '../content-items/services/entities.service';

@Component({
  selector: 'app-permissions',
  templateUrl: './permissions.component.html',
  styleUrls: ['./permissions.component.scss'],
  standalone: true,
  imports: [
    MatButtonModule,
    SharedComponentsModule,
    MatIconModule,
    RouterOutlet,
    AgGridModule,
    MatDialogActions,
    AsyncPipe,
  ],
  providers: [
    PermissionsService,
    MetadataService,
    EntitiesService,]
})
export class PermissionsComponent extends BaseWithChildDialogComponent implements OnInit, OnDestroy {
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
    this.subscription.add(this.childDialogClosed$().subscribe(() => { this.fetchPermissions(); }));
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
          ...ColumnDefinitions.Id,
          cellRenderer: IdFieldComponent,
          cellRendererParams: (() => {
            const params: IdFieldParams<Permission> = {
              tooltipGetter: (permission: Permission) => `ID: ${permission.Id}\nGUID: ${permission.Guid}`,
            };
            return params;
          })(),
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
