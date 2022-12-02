import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FeatureDetailsDialogData } from '../../apps-management/licence-info/feature-details-dialog/feature-details-dialog.models';
import { copyToClipboard } from '../../shared/helpers/copy-to-clipboard.helper';

@Component({
  selector: 'app-feature-info-dialog',
  templateUrl: './feature-info-dialog.component.html',
  styleUrls: ['./feature-info-dialog.component.scss']
})
export class FeatureInfoDialogComponent implements OnInit {

  constructor(
    // @Inject(MAT_DIALOG_DATA) public dialogData: FeatureDetailsDialogData,
    private dialogRef: MatDialogRef<FeatureInfoDialogComponent>,
    private snackBar: MatSnackBar,
  ) { }

  closeDialog(): void {
    this.dialogRef.close();
  }

  copyToClipboard(text: string): void {
    copyToClipboard(text);
    this.snackBar.open('Copied to clipboard', null, { duration: 2000 });
  }

  ngOnInit(): void {
  }

}
