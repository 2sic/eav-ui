import { Component, Inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';
import { SaveErrorsSnackBarData } from './snack-bar-save-errors.models';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-snack-bar-save-errors',
    templateUrl: './snack-bar-save-errors.component.html',
    styleUrls: ['./snack-bar-save-errors.component.scss'],
    standalone: true,
    imports: [TranslateModule],
})
export class SnackBarSaveErrorsComponent {
  constructor(@Inject(MAT_SNACK_BAR_DATA) public snackBarData: SaveErrorsSnackBarData) { }
}
