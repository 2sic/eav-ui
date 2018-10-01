import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { AdminDialogData } from '../../../shared/models/eav/admin-dialog-data';

@Component({
  selector: 'app-save-status-dialog',
  templateUrl: './save-status-dialog.component.html',
  styleUrls: ['./save-status-dialog.component.scss']
})
export class SaveStatusDialogComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<SaveStatusDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private formDialogData: AdminDialogData) { }

  ngOnInit() {
    console.log('SaveStatusDialogComponent', this.formDialogData);
  }


  publishEntry() {
    console.log('publish entry');
    this.dialogRef.close();
  }

  hideEntry() {
    console.log('hide entry');
    this.dialogRef.close();
  }

  saveAsDraftEntry() {
    console.log('save as draft entry');
    this.dialogRef.close();
  }

}
