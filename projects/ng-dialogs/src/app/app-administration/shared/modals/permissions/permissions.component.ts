import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { GridReadyEvent, GridSizeChangedEvent, ColDef, AllCommunityModules } from '@ag-grid-community/all-modules';

import { PermissionsDialogData } from '../../models/permissions-dialog-data.model';
import { PermissionsService } from '../../services/permissions.service';
import { Permission } from '../../models/permission.model';
import { PermissionsGrantComponent } from '../../ag-grid-components/permissions-grant/permissions-grant.component';
import { PermissionsGrantParams } from '../../models/permissions-grant-params';

@Component({
  selector: 'app-permissions',
  templateUrl: './permissions.component.html',
  styleUrls: ['./permissions.component.scss']
})
export class PermissionsComponent implements OnInit {
  permissions: Permission[];

  columnDefs: ColDef[] = [
    { headerName: 'Name', field: 'Title', cellClass: 'clickable', onCellClicked: this.handleNameCellClicked.bind(this), },
    { headerName: 'Condition', field: 'Identity', cellClass: 'clickable', onCellClicked: this.handleNameCellClicked.bind(this), },
    {
      headerName: 'Grant', cellClass: 'clickable-with-button', onCellClicked: this.handleNameCellClicked.bind(this),
      cellRenderer: 'permissionsGrantComponent', cellRendererParams: <PermissionsGrantParams>{
        onDelete: this.deletePermission.bind(this),
      },
    },
  ];
  frameworkComponents = {
    permissionsGrantComponent: PermissionsGrantComponent,
  };
  modules = AllCommunityModules;

  constructor(
    private dialogRef: MatDialogRef<PermissionsComponent>,
    @Inject(MAT_DIALOG_DATA) private permissionsDialogData: PermissionsDialogData,
    private permissionsService: PermissionsService,
  ) { }

  ngOnInit() {
    this.fetchPermissions();
  }

  onGridReady(params: GridReadyEvent) {
    params.api.sizeColumnsToFit();
  }

  onGridSizeChanged(params: GridSizeChangedEvent) {
    params.api.sizeColumnsToFit();
  }

  edit(item) {
    // eavAdminDialogs.openItemEditWithEntityId(item.Id, svc.liveListReload);
  }

  add() {
    alert('Add new permission');
    // vm.openMetadata(svc.targetType, svc.keyType, svc.key, svc.ctName, svc.liveListReload);
  }

  refresh() {
    this.fetchPermissions();
  }

  private deletePermission(permission: Permission) {
    if (confirm(`Delete '${permission.Title}' (${permission.Id})?`)) {
      this.permissionsService.delete(permission.Id).subscribe(() => {
        this.fetchPermissions();
      });
    }
  }

  closeDialog() {
    this.dialogRef.close();
  }

  private openMetadata(targetType, keyType, key, contentType, closeCallback) {
    // const items = [
    //   {
    //     ContentTypeName: contentType,
    //     Metadata: {
    //       TargetType: targetType,
    //       KeyType: keyType,
    //       Key: key
    //     }
    //   }
    // ];

    // eavAdminDialogs.openEditItems(items, closeCallback, { partOfPage: false });
  }

  private fetchPermissions() {
    this.permissionsService.getAll(this.permissionsDialogData.type,
      this.permissionsDialogData.keyType, this.permissionsDialogData.staticName
    ).subscribe((permissions: Permission[]) => {
      this.permissions = permissions;
    });
  }

  private handleNameCellClicked() {
    alert('Open edit');
  }
}
