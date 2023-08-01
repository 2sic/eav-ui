import { Component, Inject, Input, OnDestroy, OnInit } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';

@Component({
  selector: 'app-auto-translate-disabled-warning-dialog',
  templateUrl: './auto-translate-disabled-warning-dialog.component.html',
  styleUrls: ['./auto-translate-disabled-warning-dialog.component.scss'],
})
export class AutoTranslateDisabledWarningDialog implements OnInit {
  // @Input() public isAutoTranslateAll: boolean;

  constructor(
    private dialogRef: MatDialogRef<AutoTranslateDisabledWarningDialog>,
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
  ) {
  }

  ngOnInit(): void {
  }

  closeDialog() {
    this.dialogRef.close();
  }
}