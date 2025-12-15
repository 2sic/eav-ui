import { Component, HostBinding, inject, Inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { isCtrlEnter } from '../../../edit/dialog/main/keyboard-shortcuts';
import { SaveCloseButtonFabComponent } from '../../../shared/modules/save-close-button-fab/save-close-button-fab';
import { SafeHtmlPipe } from '../../../shared/pipes/safe-html.pipe';
import { ConfirmDeleteDialogData } from './confirm-delete-dialog.models';

@Component({
  selector: 'app-confirm-delete-dialog',
  templateUrl: './confirm-delete-dialog.html',
  styleUrls: ['./confirm-delete-dialog.scss'],
  imports: [
    MatButtonModule,
    SafeHtmlPipe,
    MatIconModule,
    MatDialogActions,
    SaveCloseButtonFabComponent,
  ]
})
export class ConfirmDeleteDialogComponent implements OnInit {
  @HostBinding('className') hostClass = 'dialog-component';

  #snackBar = inject(MatSnackBar);

  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogData: ConfirmDeleteDialogData,
    public dialog: MatDialogRef<ConfirmDeleteDialogComponent>,
  ) { }

  ngOnInit() {
    if (this.dialogData.hasDeleteSnackbar)
    this.#snackBar.open('Deleting...', undefined, { duration: 5000 });
    this.#watchKeyboardShortcuts();
  }

  #watchKeyboardShortcuts(): void {
    this.dialog.keydownEvents().subscribe(event => {
      if (isCtrlEnter(event)) {
        event.preventDefault();
        this.dialog.close(true);
      }
    });
  }

  closeDialog(confirm?: boolean) {
    this.#snackBar.dismiss();
    confirm
      ? this.dialog.close(confirm)
      : this.dialog.close();
  }

  saveAndClose(confirm: boolean) {
    this.closeDialog(confirm);
    if (this.dialogData.hasDeleteSnackbar)
      this.#snackBar.dismiss();
  }
}
