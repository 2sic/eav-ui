import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { copyToClipboard } from '../../shared/helpers/copy-to-clipboard.helper';
import { Feature } from '../models';
import { FeatureDetailService } from '../services/feature-detail.service';

@Component({
  selector: 'app-feature-info-dialog',
  templateUrl: './feature-info-dialog.component.html',
  styleUrls: ['./feature-info-dialog.component.scss']
})
export class FeatureInfoDialogComponent implements OnInit {
  feature$: Observable<Feature>;

  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogData: string,
    private dialogRef: MatDialogRef<FeatureInfoDialogComponent>,
    private snackBar: MatSnackBar,
    private featureDetailService: FeatureDetailService,
  ) {
    this.feature$ = this.featureDetailService.getFeatureDetails(dialogData);
   }

  ngOnInit(): void {
  }

  copyToClipboard(text: string): void {
    copyToClipboard(text);
    this.snackBar.open('Copied to clipboard', null, { duration: 2000 });
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

}
