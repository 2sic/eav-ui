import { Component, Inject, OnInit } from '@angular/core';
import { MatSnackBarRef, MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';

import { FieldErrorMessage } from '../../../shared/models/eav/field-error-message';

@Component({
  selector: 'app-snack-bar-save-errors',
  templateUrl: './snack-bar-save-errors.component.html',
  styleUrls: ['./snack-bar-save-errors.component.scss']
})
export class SnackBarSaveErrorsComponent implements OnInit {
  fieldErrors: FieldErrorMessage[] = [];

  constructor(
    public snackRef: MatSnackBarRef<SnackBarSaveErrorsComponent>,
    @Inject(MAT_SNACK_BAR_DATA) private injectedData: { fieldErrors: FieldErrorMessage[] },
  ) { }

  ngOnInit() {
    this.fieldErrors = this.injectedData.fieldErrors;
  }
}
