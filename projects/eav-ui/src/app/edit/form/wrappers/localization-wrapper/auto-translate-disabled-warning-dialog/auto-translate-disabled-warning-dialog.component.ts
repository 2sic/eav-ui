import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-auto-translate-disabled-warning-dialog',
  templateUrl: './auto-translate-disabled-warning-dialog.component.html',
  styleUrls: ['./auto-translate-disabled-warning-dialog.component.scss'],
})
export class AutoTranslateDisabledWarningDialog implements OnInit, OnDestroy {

  constructor(
    private dialogRef: MatDialogRef<AutoTranslateDisabledWarningDialog>,
  ) {
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
  }

  private closeDialog() {
    this.dialogRef.close();
  }
}