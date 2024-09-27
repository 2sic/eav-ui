import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TippyDirective } from '../../../shared/directives/tippy.directive';
import { copyToClipboard } from '../../../shared/helpers/copy-to-clipboard.helper';
import { SafeHtmlPipe } from '../../../shared/pipes/safe-html.pipe';
import { FeatureDetailsDialogData } from './feature-details-dialog.models';

@Component({
  selector: 'app-feature-details-dialog',
  templateUrl: './feature-details-dialog.component.html',
  standalone: true,
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    TippyDirective,
    SafeHtmlPipe,
  ]
})
export class FeatureDetailsDialogComponent {

  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogData: FeatureDetailsDialogData,
    protected dialog: MatDialogRef<FeatureDetailsDialogComponent>,
    private snackBar: MatSnackBar,
  ) { }

  protected feature = this.dialogData.feature;

  // TODO: @2pp - this code is duplicated in ca. 6 places
  // Please create a simple ClipboardService for this
  // and the use ca. like this
  // protected clipboard = transient(ClipboardService);
  // ... in the HTML then
  // (click)="clipboard.copyToClipboard('your text')"
  copyToClipboard(text: string): void {
    copyToClipboard(text);
    this.snackBar.open('Copied to clipboard', null, { duration: 2000 });
  }
}
