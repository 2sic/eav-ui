import { Component, inject, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { transient } from 'projects/core';
import { SaveCloseButtonFabComponent } from '../../../shared/modules/save-close-button-fab/save-close-button-fab.component';
import { AppExtensionsService } from '../../services/app-extensions.service';
import { ConfirmDeleteDialogComponent } from '../confirm-delete-dialog/confirm-delete-dialog.component';
import { ConfirmDeleteDialogData } from '../confirm-delete-dialog/confirm-delete-dialog.models';
@Component({
  selector: 'app-delete-extension',
  templateUrl: './delete-extension.component.html',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatDialogActions,
    SaveCloseButtonFabComponent,
    MatSlideToggleModule,
    FormsModule,
  ]
})
export class DeleteExtensionComponent {
  #snackBar = inject(MatSnackBar);
  #extensionsSvc = transient(AppExtensionsService);

  extensionFolder = this.route.snapshot.paramMap.get('extension') as 'extension';
  withData = false;

  constructor(
    private route: ActivatedRoute,
    @Inject(MAT_DIALOG_DATA) public dialogData: ConfirmDeleteDialogData,
    public dialog: MatDialogRef<ConfirmDeleteDialogComponent>,
  ) { }

  closeDialog(confirm?: boolean) {
    this.#snackBar.dismiss();
    confirm
      ? this.dialog.close(confirm)
      : this.dialog.close();
  }

  saveAndClose(confirm: boolean) {
    if (confirm) {
      this.#extensionsSvc
        .deleteExtension(
          this.extensionFolder, // Extension folder
          '',                 // Edition
          false,              // Force delete
          this.withData       // Delete with data 
        )
        .subscribe(() => {
          this.dialog.close(true);
        });
    } else {
      this.dialog.close(false);
    }

    if (this.dialogData.hasDeleteSnackbar)
      this.#snackBar.dismiss();
  }
}
