import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { GridReadyEvent, GridSizeChangedEvent, ColDef, AllCommunityModules } from '@ag-grid-community/all-modules';

import { PermissionsDialogData } from '../../models/permissions-dialog-data.model';
import { PermissionsService } from '../../services/permissions.service';
import { Permission } from '../../models/permission.model';

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
    { headerName: 'Grant', field: 'Grant', cellClass: 'clickable-with-button', onCellClicked: this.handleNameCellClicked.bind(this), },
  ];
  frameworkComponents = {
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

  tryToDelete(item) {
    // if (confirm("Delete '" + item.Title + "' (" + item.Id + ') ?')) // todo: probably change .Title to ._Title
    //   svc.delete(item.Id);
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
    this.permissionsService.getAll(
      this.permissionsDialogData.appId, this.permissionsDialogData.type,
      this.permissionsDialogData.keyType, this.permissionsDialogData.staticName
    ).subscribe((permissions: Permission[]) => {
      this.permissions = permissions;
    });
  }

  private handleNameCellClicked() {
    alert('Open edit');
  }
}
