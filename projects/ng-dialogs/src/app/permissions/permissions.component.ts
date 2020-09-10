import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription, BehaviorSubject } from 'rxjs';
import { filter, startWith, map, pairwise } from 'rxjs/operators';
import { AllCommunityModules, GridOptions, CellClickedEvent, ValueGetterParams } from '@ag-grid-community/all-modules';

import { PermissionsService } from './services/permissions.service';
import { Permission } from './models/permission.model';
import { PermissionsActionsComponent } from './ag-grid-components/permissions-actions/permissions-actions.component';
import { PermissionsActionsParams } from './ag-grid-components/permissions-actions/permissions-actions.models';
import { EditForm } from '../shared/models/edit-form.model';
import { eavConstants, EavMetadataKey } from '../shared/constants/eav.constants';
import { IdFieldComponent } from '../shared/components/id-field/id-field.component';
import { defaultGridOptions } from '../shared/constants/default-grid-options.constants';
import { convertFormToUrl } from '../shared/helpers/url-prep.helper';

@Component({
  selector: 'app-permissions',
  templateUrl: './permissions.component.html',
  styleUrls: ['./permissions.component.scss'],
  // spm TODO: can't be onPush yet because contains router-outlet
  // changeDetection: ChangeDetectionStrategy.OnPush
})
export class PermissionsComponent implements OnInit, OnDestroy {
  permissions$ = new BehaviorSubject<Permission[]>(null);

  modules = AllCommunityModules;
  gridOptions: GridOptions = {
    ...defaultGridOptions,
    frameworkComponents: {
      idFieldComponent: IdFieldComponent,
      permissionsActionsComponent: PermissionsActionsComponent,
    },
    columnDefs: [
      {
        headerName: 'ID', field: 'Id', width: 70, headerClass: 'dense', cellClass: 'id-action no-padding no-outline',
        cellRenderer: 'idFieldComponent', sortable: true, filter: 'agTextColumnFilter', valueGetter: this.idValueGetter,
      },
      {
        headerName: 'Name', field: 'Title', flex: 2, minWidth: 250, cellClass: 'primary-action highlight',
        sortable: true, filter: 'agTextColumnFilter', onCellClicked: this.editPermission.bind(this),
      },
      {
        width: 40, cellClass: 'secondary-action no-padding', cellRenderer: 'permissionsActionsComponent',
        cellRendererParams: {
          onDelete: this.deletePermission.bind(this),
        } as PermissionsActionsParams,
      },
      {
        headerName: 'Identity', field: 'Identity', flex: 2, minWidth: 250, cellClass: 'no-outline', sortable: true,
        filter: 'agTextColumnFilter',
      },
      {
        headerName: 'Condition', field: 'Condition', flex: 2, minWidth: 250, cellClass: 'no-outline', sortable: true,
        filter: 'agTextColumnFilter',
      },
      {
        headerName: 'Grant', field: 'Grant', width: 70, headerClass: 'dense', cellClass: 'no-outline',
        sortable: true, filter: 'agTextColumnFilter',
      },
    ],
  };

  private subscription = new Subscription();
  private targetType = parseInt(this.route.snapshot.paramMap.get('type'), 10);
  private keyType = this.route.snapshot.paramMap.get('keyType');
  private key = this.route.snapshot.paramMap.get('key');

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

  private idValueGetter(params: ValueGetterParams) {
    const permission: Permission = params.data;
    return `ID: ${permission.Id}\nGUID: ${permission.Guid}`;
  }

  private fetchPermissions() {
    this.permissionsService.getAll(this.targetType, this.keyType, this.key).subscribe(permissions => {
      this.permissions$.next(permissions);
    });
  }

  editPermission(params: CellClickedEvent) {
    let form: EditForm;
    if (params == null) {
      let target: string;
      const keys = Object.keys(eavConstants.metadata) as EavMetadataKey[];
      for (const key of keys) {
        if (eavConstants.metadata[key].type !== this.targetType) { continue; }
        target = eavConstants.metadata[key].target;
        break;
      }
      form = {
        items: [{
          ContentTypeName: eavConstants.contentTypes.permissions,
          For: {
            Target: target,
            ...(this.keyType === eavConstants.keyTypes.guid && { Guid: this.key }),
            ...(this.keyType === eavConstants.keyTypes.number && { Number: parseInt(this.key, 10) }),
            ...(this.keyType === eavConstants.keyTypes.string && { String: this.key }),
          }
        }],
      };
    } else {
      const permission: Permission = params.data;
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
