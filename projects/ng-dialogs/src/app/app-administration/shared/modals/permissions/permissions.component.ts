import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { PermissionsDialogData } from '../../models/permissions-dialog-data.model';

@Component({
  selector: 'app-permissions',
  templateUrl: './permissions.component.html',
  styleUrls: ['./permissions.component.scss']
})
export class PermissionsComponent implements OnInit {

  constructor(
    private dialogRef: MatDialogRef<PermissionsComponent>,
    @Inject(MAT_DIALOG_DATA) private permissionsDialogData: PermissionsDialogData,
  ) { }

  ngOnInit() {

  }
}
