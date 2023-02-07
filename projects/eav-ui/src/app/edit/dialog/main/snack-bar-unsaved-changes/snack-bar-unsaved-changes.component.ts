import { Component, Inject } from '@angular/core';
import { MatLegacySnackBarRef as MatSnackBarRef, MAT_LEGACY_SNACK_BAR_DATA as MAT_SNACK_BAR_DATA } from '@angular/material/legacy-snack-bar';
import { UnsavedChangesSnackBarData } from './snack-bar-unsaved-changes.models';

@Component({
  selector: 'app-snack-bar-unsaved-changes',
  templateUrl: './snack-bar-unsaved-changes.component.html',
  styleUrls: ['./snack-bar-unsaved-changes.component.scss'],
})
export class SnackBarUnsavedChangesComponent {
  constructor(
    private snackRef: MatSnackBarRef<SnackBarUnsavedChangesComponent>,
    @Inject(MAT_SNACK_BAR_DATA) private snackBarData: UnsavedChangesSnackBarData,
  ) { }

  saveChanges(save: boolean) {
    this.snackBarData.save = save;
    this.snackRef.dismissWithAction();
  }
}
