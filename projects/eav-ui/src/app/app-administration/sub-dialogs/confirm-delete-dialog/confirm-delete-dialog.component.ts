import { Component, HostBinding, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SafeHtmlPipe } from '../../../shared/pipes/safe-html.pipe';
import { ConfirmDeleteDialogData } from './confirm-delete-dialog.models';

@Component({
  selector: 'app-confirm-delete-dialog',
  templateUrl: './confirm-delete-dialog.component.html',
  styleUrls: ['./confirm-delete-dialog.component.scss'],
  imports: [
    MatCardModule,
    MatButtonModule,
    SafeHtmlPipe,
  ]
})
export class ConfirmDeleteDialogComponent {
  @HostBinding('className') hostClass = 'dialog-component';

  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogData: ConfirmDeleteDialogData,
    private dialog: MatDialogRef<ConfirmDeleteDialogComponent>,
  ) { }

  closeDialog(confirm?: boolean) {
    this.dialog.close(confirm);
  }
}
