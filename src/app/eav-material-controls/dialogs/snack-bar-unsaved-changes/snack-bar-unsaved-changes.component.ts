import { Component, OnInit, Inject } from '@angular/core';
import { MatSnackBar, MatSnackBarRef, MAT_SNACK_BAR_DATA } from '@angular/material';

@Component({
  selector: 'app-snack-bar-unsaved-changes',
  templateUrl: './snack-bar-unsaved-changes.component.html',
  styleUrls: ['./snack-bar-unsaved-changes.component.scss']
})
export class SnackBarUnsavedChangesComponent implements OnInit {

  constructor(public snackRef: MatSnackBarRef<SnackBarUnsavedChangesComponent>,
    @Inject(MAT_SNACK_BAR_DATA) private snackBarData: any) {
  }

  ngOnInit() {
  }

  saveChanges(save: boolean) {
    this.snackBarData.save = save;
    this.snackRef.dismissWithAction();
  }
}
