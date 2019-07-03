import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-save-status-dialog',
  templateUrl: './save-status-dialog.component.html',
  styleUrls: ['./save-status-dialog.component.scss']
})
export class SaveStatusDialogComponent implements OnInit {
  versioningOptions;
  publishMode: string;

  constructor(public dialogRef: MatDialogRef<SaveStatusDialogComponent>) { }

  ngOnInit() { }

  publishEntry() {
    this.publishMode = 'show';
    this.dialogRef.close();
  }

  hideEntry() {
    this.publishMode = 'hide';
    this.dialogRef.close();
  }

  saveAsDraftEntry() {
    this.publishMode = 'branch';
    this.dialogRef.close();
  }
}
