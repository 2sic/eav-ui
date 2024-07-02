import { Component, HostBinding, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ConfirmDeleteDialogData } from './confirm-delete-dialog.models';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { SafeHtmlPipe } from '../../shared/pipes/safe-html.pipe';

@Component({
  selector: 'app-confirm-delete-dialog',
  templateUrl: './confirm-delete-dialog.component.html',
  styleUrls: ['./confirm-delete-dialog.component.scss'],
  standalone: true,
  imports: [
    MatCardModule,
    MatButtonModule,
    SafeHtmlPipe,
  ],
})
export class ConfirmDeleteDialogComponent {
  @HostBinding('className') hostClass = 'dialog-component';

  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogData: ConfirmDeleteDialogData,
    private dialogRef: MatDialogRef<ConfirmDeleteDialogComponent>,
  ) { }

  closeDialog(confirm?: boolean) {
    this.dialogRef.close(confirm);
  }
}
