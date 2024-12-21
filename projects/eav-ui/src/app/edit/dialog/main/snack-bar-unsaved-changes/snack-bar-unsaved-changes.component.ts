import { UpperCasePipe } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';
import { TranslateModule } from '@ngx-translate/core';
import { UnsavedChangesSnackBarData } from './snack-bar-unsaved-changes.models';

@Component({
    selector: 'app-snack-bar-unsaved-changes',
    templateUrl: './snack-bar-unsaved-changes.component.html',
    styleUrls: ['./snack-bar-unsaved-changes.component.scss'],
    imports: [
        MatButtonModule,
        UpperCasePipe,
        TranslateModule,
        UpperCasePipe
    ]
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
