import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface DialogData {
  body: string;
  name: string;
  notes: string;
}

@Component({
  selector: 'app-help-popup',
  templateUrl: './help-popup.component.html',
})
export class HelpPopupComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<HelpPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) { }

  ngOnInit() {
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
