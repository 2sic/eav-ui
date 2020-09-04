import { Component, OnInit, Inject, ChangeDetectionStrategy } from '@angular/core';
import { MatSnackBarRef, MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';

import { UnsavedChangesSnackData } from './snack-bar-unsaved-changes.models';

@Component({
  selector: 'app-snack-bar-unsaved-changes',
  templateUrl: './snack-bar-unsaved-changes.component.html',
  styleUrls: ['./snack-bar-unsaved-changes.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SnackBarUnsavedChangesComponent implements OnInit {

  constructor(
    private snackRef: MatSnackBarRef<SnackBarUnsavedChangesComponent>,
    @Inject(MAT_SNACK_BAR_DATA) private snackBarData: UnsavedChangesSnackData,
  ) { }

  ngOnInit() {
  }

  saveChanges(save: boolean) {
    this.snackBarData.save = save;
    this.snackRef.dismissWithAction();
  }
}
