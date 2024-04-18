import { Component, Inject } from '@angular/core';
import { MatSnackBarRef, MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';
import { UnsavedChangesSnackBarData } from './snack-bar-unsaved-changes.models';
import { TranslateModule } from '@ngx-translate/core';
import { UpperCasePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { FlexModule } from '@angular/flex-layout/flex';

@Component({
    selector: 'app-snack-bar-unsaved-changes',
    templateUrl: './snack-bar-unsaved-changes.component.html',
    styleUrls: ['./snack-bar-unsaved-changes.component.scss'],
    standalone: true,
    imports: [
        FlexModule,
        MatButtonModule,
        UpperCasePipe,
        TranslateModule,
    ],
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
