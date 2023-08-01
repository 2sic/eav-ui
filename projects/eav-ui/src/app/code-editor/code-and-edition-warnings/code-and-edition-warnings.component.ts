import { Component, Inject } from '@angular/core';
import { MatLegacySnackBarRef as MatSnackBarRef, MAT_LEGACY_SNACK_BAR_DATA as MAT_SNACK_BAR_DATA } from '@angular/material/legacy-snack-bar';
import { CodeAndEditionWarningsSnackBarData } from './code-and-edition-warnings.models';

@Component({
  selector: 'app-code-and-edition-warnings',
  templateUrl: './code-and-edition-warnings.component.html',
  styleUrls: ['./code-and-edition-warnings.component.scss'],
})
export class CodeAndEditionWarningsComponent {
  constructor(
    private snackRef: MatSnackBarRef<CodeAndEditionWarningsComponent>,
    @Inject(MAT_SNACK_BAR_DATA) public snackBarData: CodeAndEditionWarningsSnackBarData,
  ) { }

  openCodeBehind(): void {
    this.snackBarData.openCodeBehind = true;
    this.snackRef.dismissWithAction();
  }
}
