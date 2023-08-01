import { Component, Inject } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { copyToClipboard } from '../../../shared/helpers/copy-to-clipboard.helper';
import { FeatureDetailsDialogData } from './feature-details-dialog.models';

@Component({
  selector: 'app-feature-details-dialog',
  templateUrl: './feature-details-dialog.component.html',
  styleUrls: ['./feature-details-dialog.component.scss']
})
export class FeatureDetailsDialogComponent {

  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogData: FeatureDetailsDialogData,
    private dialogRef: MatDialogRef<FeatureDetailsDialogComponent>,
    private snackBar: MatSnackBar,
  ) { }

  closeDialog(): void {
    this.dialogRef.close();
  }

  findOutMore(link: string): void {
    window.open(link, '_blank');
  }

  copyToClipboard(text: string): void {
    copyToClipboard(text);
    this.snackBar.open('Copied to clipboard', null, { duration: 2000 });
  }
}
