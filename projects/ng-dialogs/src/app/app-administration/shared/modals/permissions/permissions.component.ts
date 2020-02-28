import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialogRef } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { GridReadyEvent, GridSizeChangedEvent, ColDef, AllCommunityModules, CellClickedEvent } from '@ag-grid-community/all-modules';

import { PermissionsService } from '../../services/permissions.service';
import { Permission } from '../../models/permission.model';
import { PermissionsGrantComponent } from '../../ag-grid-components/permissions-grant/permissions-grant.component';
import { PermissionsGrantParams } from '../../models/permissions-grant-params';
import { EditForm } from '../../models/edit-form.model';
import { DialogService } from '../../../../shared/components/dialog-service/dialog.service';
import { ITEMS_EDIT_DIALOG } from '../../../../shared/constants/dialog-names';
import { eavConstants, EavMetadataKey } from '../../../../shared/constants/eav-constants';

@Component({
  selector: 'app-permissions',
  templateUrl: './permissions.component.html',
  styleUrls: ['./permissions.component.scss']
})
export class PermissionsComponent implements OnInit {
  permissions: Permission[];

  columnDefs: ColDef[] = [
    { headerName: 'Name', field: 'Title', cellClass: 'clickable', onCellClicked: this.editPermission.bind(this), },
    { headerName: 'Condition', field: 'Identity', cellClass: 'clickable', onCellClicked: this.editPermission.bind(this), },
    {
      headerName: 'Grant', cellClass: 'clickable-with-button', onCellClicked: this.editPermission.bind(this),
      cellRenderer: 'permissionsGrantComponent', cellRendererParams: <PermissionsGrantParams>{
        onDelete: this.deletePermission.bind(this),
      },
    },
  ];
  frameworkComponents = {
    permissionsGrantComponent: PermissionsGrantComponent,
  };
  modules = AllCommunityModules;

  private subscription: Subscription = new Subscription();
  private targetType: number;
  private keyType: string;
  private key: string;

  constructor(
    private dialogRef: MatDialogRef<PermissionsComponent>,
    private router: Router,
    private route: ActivatedRoute,
    private dialogService: DialogService,
    private permissionsService: PermissionsService,
  ) { }

  ngOnInit() {
    this.targetType = parseInt(this.route.snapshot.paramMap.get('type'), 10);
    this.keyType = this.route.snapshot.paramMap.get('keyType');
    this.key = this.route.snapshot.paramMap.get('key');
    this.fetchPermissions();
    this.subscription.add(
      this.dialogService.subToClosed([ITEMS_EDIT_DIALOG]).subscribe(closedDialog => {
        console.log('Dialog closed event captured:', closedDialog);
        this.fetchPermissions();
      })
    );
  }

  onGridReady(params: GridReadyEvent) {
    params.api.sizeColumnsToFit();
  }

  onGridSizeChanged(params: GridSizeChangedEvent) {
    params.api.sizeColumnsToFit();
  }

  fetchPermissions() {
    this.permissionsService.getAll(this.targetType, this.keyType, this.key).subscribe(permissions => {
      this.permissions = permissions;
    });
  }

  editPermission(params: CellClickedEvent) {
    let form: EditForm;
    if (params === null) {
      let target: string;
      const keys = <EavMetadataKey[]>Object.keys(eavConstants.metadata);
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
        persistedData: null,
      };
    } else {
      const permission = <Permission>params.data;
      form = {
        items: [{ EntityId: permission.Id.toString(), Title: permission.Title }],
        persistedData: null,
      };
    }
    this.router.navigate([`edit/${JSON.stringify(form)}`], { relativeTo: this.route });
  }

  private deletePermission(permission: Permission) {
    if (!confirm(`Delete '${permission.Title}' (${permission.Id})?`)) { return; }

    this.permissionsService.delete(permission.Id).subscribe(() => {
      this.fetchPermissions();
    });
  }

  closeDialog() {
    this.dialogRef.close();
  }
}
