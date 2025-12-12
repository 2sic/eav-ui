import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';
import { CodeAndEditionWarningsSnackBarData } from './code-and-edition-warnings.models';

@Component({
    selector: 'app-code-and-edition-warnings',
    templateUrl: './code-and-edition-warnings.html',
    styleUrls: ['./code-and-edition-warnings.scss'],
    imports: [MatButtonModule]
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
