import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { copyToClipboard } from '../../../shared/helpers/copy-to-clipboard.helper';
import { FeatureDetailsDialogData } from './feature-details-dialog.models';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { TippyDirective } from '../../../shared/directives/tippy.directive';
import { SafeHtmlPipe } from '../../../shared/pipes/safe-html.pipe';

@Component({
  selector: 'app-feature-details-dialog',
  templateUrl: './feature-details-dialog.component.html',
  styleUrls: ['./feature-details-dialog.component.scss'],
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
    private dialogRef: MatDialogRef<FeatureDetailsDialogComponent>,
    private snackBar: MatSnackBar,
  ) { }

  closeDialog(): void {
    this.dialogRef.close();
  }

  findOutMore(link: string): void {
    window.open(link, '_blank');
  }

  copyToClipboard(text: string): void {
    copyToClipboard(text);
    this.snackBar.open('Copied to clipboard', null, { duration: 2000 });
  }
}
