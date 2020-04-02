import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-manage-content-list',
  templateUrl: './manage-content-list.component.html',
  styleUrls: ['./manage-content-list.component.scss']
})
export class ManageContentListComponent implements OnInit, OnDestroy {

  constructor(private dialogRef: MatDialogRef<ManageContentListComponent>) { }

  ngOnInit() {
  }

  ngOnDestroy() {
  }

  closeDialog() {
    this.dialogRef.close();
  }

}
