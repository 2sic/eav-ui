import { GridOptions } from '@ag-grid-community/core';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { BehaviorSubject, Subscription } from 'rxjs';
import { filter, map, pairwise, startWith } from 'rxjs/operators';
import { IdFieldComponent } from '../shared/components/id-field/id-field.component';
import { IdFieldParams } from '../shared/components/id-field/id-field.models';
import { defaultGridOptions } from '../shared/constants/default-grid-options.constants';
import { eavConstants, MetadataKeyType } from '../shared/constants/eav.constants';
import { convertFormToUrl } from '../shared/helpers/url-prep.helper';
import { EditForm } from '../shared/models/edit-form.model';
import { PermissionsActionsComponent } from './ag-grid-components/permissions-actions/permissions-actions.component';
import { PermissionsActionsParams } from './ag-grid-components/permissions-actions/permissions-actions.models';
import { Permission } from './models/permission.model';
import { PermissionsService } from './services/permissions.service';

@Component({
  selector: 'app-permissions',
  templateUrl: './permissions.component.html',
  styleUrls: ['./permissions.component.scss'],
})
export class PermissionsComponent implements OnInit, OnDestroy {
  permissions$ = new BehaviorSubject<Permission[]>(undefined);

  gridOptions: GridOptions = {
    ...defaultGridOptions,
    columnDefs: [
      {
        headerName: 'ID', field: 'Id', width: 70, headerClass: 'dense', cellClass: 'id-action no-padding no-outline'.split(' '),
        cellRenderer: IdFieldComponent, sortable: true, filter: 'agNumberColumnFilter',
        valueGetter: (params) => (params.data as Permission).Id,
        cellRendererParams: {
          tooltipGetter: (permission: Permission) => `ID: ${permission.Id}\nGUID: ${permission.Guid}`,
        } as IdFieldParams,
      },
      {
        field: 'Name', flex: 2, minWidth: 250, cellClass: 'primary-action highlight'.split(' '),
        sortable: true, sort: 'asc', filter: 'agTextColumnFilter',
        onCellClicked: (event) => this.editPermission(event.data as Permission),
        valueGetter: (params) => (params.data as Permission).Title,
      },
      {
        field: 'Identity', flex: 2, minWidth: 250, cellClass: 'no-outline', sortable: true,
        filter: 'agTextColumnFilter', valueGetter: (params) => (params.data as Permission).Identity,
      },
      {
        field: 'Condition', flex: 2, minWidth: 250, cellClass: 'no-outline', sortable: true,
        filter: 'agTextColumnFilter', valueGetter: (params) => (params.data as Permission).Condition,
      },
      {
        field: 'Grant', width: 70, headerClass: 'dense', cellClass: 'no-outline',
        sortable: true, filter: 'agTextColumnFilter', valueGetter: (params) => (params.data as Permission).Grant,
      },
      {
        width: 42, cellClass: 'secondary-action no-padding'.split(' '), cellRenderer: PermissionsActionsComponent, pinned: 'right',
        cellRendererParams: {
          onDelete: (permission) => this.deletePermission(permission),
        } as PermissionsActionsParams,
      },
    ],
  };

  private subscription = new Subscription();
  private targetType = parseInt(this.route.snapshot.paramMap.get('targetType'), 10);
  private keyType = this.route.snapshot.paramMap.get('keyType') as MetadataKeyType;
  private key = this.route.snapshot.paramMap.get('key');
  private prefills: Record<string, Record<string, string>> = {
    [eavConstants.metadata.language.targetType]: {
      PermissionType: 'language',
    },
  };

  constructor(
    private dialogRef: MatDialogRef<PermissionsComponent>,
    private router: Router,
    private route: ActivatedRoute,
    private permissionsService: PermissionsService,
    private snackBar: MatSnackBar,
  ) { }

  ngOnInit() {
    this.fetchPermissions();
    this.refreshOnChildClosed();
  }

  ngOnDestroy() {
    this.permissions$.complete();
    this.subscription.unsubscribe();
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

  private refreshOnChildClosed() {
    this.subscription.add(
      this.router.events.pipe(
        filter(event => event instanceof NavigationEnd),
        startWith(!!this.route.snapshot.firstChild),
        map(() => !!this.route.snapshot.firstChild),
        pairwise(),
        filter(([hadChild, hasChild]) => hadChild && !hasChild),
      ).subscribe(() => {
        this.fetchPermissions();
      })
    );
  }

}
