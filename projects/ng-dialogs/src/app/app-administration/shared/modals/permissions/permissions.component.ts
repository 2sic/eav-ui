import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialogRef } from '@angular/material/dialog';
import { GridReadyEvent, GridSizeChangedEvent, ColDef, AllCommunityModules } from '@ag-grid-community/all-modules';

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
    private router: Router,
    private route: ActivatedRoute,
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

  edit(item: any) {
    // eavAdminDialogs.openItemEditWithEntityId(item.Id, svc.liveListReload);
  }

  add() {
    // vm.openMetadata(svc.targetType, svc.keyType, svc.key, svc.ctName, svc.liveListReload);
    this.router.navigate(['edit'], { relativeTo: this.route });
  }

  refresh() {
    this.fetchPermissions();
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

  private openMetadata(targetType: any, keyType: any, key: any, contentType: any, closeCallback: any) {
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
    const type = parseInt(this.route.snapshot.paramMap.get('type'), 10);
    const keyType = this.route.snapshot.paramMap.get('keyType');
    const contentTypeStaticName = this.route.snapshot.paramMap.get('contentTypeStaticName');
    this.permissionsService.getAll(type, keyType, contentTypeStaticName).subscribe(permissions => {
      this.permissions = permissions;
    });
  }

  private handleNameCellClicked() {
    alert('Open edit');
  }
}
