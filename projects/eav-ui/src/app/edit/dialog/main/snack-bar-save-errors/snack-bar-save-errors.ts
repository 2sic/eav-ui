import { Component, Inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';
import { TranslateModule } from '@ngx-translate/core';
import { SaveErrorsSnackBarData } from './snack-bar-save-errors.models';

@Component({
    selector: 'app-snack-bar-save-errors',
    templateUrl: './snack-bar-save-errors.html',
    styleUrls: ['./snack-bar-save-errors.scss'],
    imports: [TranslateModule]
})
export class SnackBarSaveErrorsComponent {
  constructor(@Inject(MAT_SNACK_BAR_DATA) public snackBarData: SaveErrorsSnackBarData) { }
}
