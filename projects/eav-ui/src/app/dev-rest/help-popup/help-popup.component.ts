import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HelpPopupData } from './help-popup.models';

@Component({
  selector: 'app-help-popup',
  templateUrl: './help-popup.component.html',
})
export class HelpPopupComponent implements OnInit {

  constructor(private dialogRef: MatDialogRef<HelpPopupComponent>, @Inject(MAT_DIALOG_DATA) public dialogData: HelpPopupData) { }

  ngOnInit() {
  }

  closeDialog() {
    this.dialogRef.close();
  }
}
