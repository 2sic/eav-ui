import { Component, Inject } from '@angular/core';
import { MAT_LEGACY_SNACK_BAR_DATA as MAT_SNACK_BAR_DATA } from '@angular/material/legacy-snack-bar';
import { SaveErrorsSnackBarData } from './snack-bar-save-errors.models';

@Component({
  selector: 'app-snack-bar-save-errors',
  templateUrl: './snack-bar-save-errors.component.html',
  styleUrls: ['./snack-bar-save-errors.component.scss'],
})
export class SnackBarSaveErrorsComponent {
  constructor(@Inject(MAT_SNACK_BAR_DATA) public snackBarData: SaveErrorsSnackBarData) { }
}
