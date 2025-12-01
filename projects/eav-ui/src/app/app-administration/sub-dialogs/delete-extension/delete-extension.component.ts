import { Component, inject, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar } from '@angular/material/snack-bar';
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
export class DeleteExtensionComponent { // implements OnInit {
  #snackBar = inject(MatSnackBar);
  #extensionsSvc = transient(AppExtensionsService);

  extensionName = "radmin"; // TODO: @2pp - get extension from route data
  withData = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogData: ConfirmDeleteDialogData,
    public dialog: MatDialogRef<ConfirmDeleteDialogComponent>
  ) { }

  
  // ngOnInit(params: string): void {
  //   this.extensionName = this.params.extension;
  // }

  closeDialog(confirm?: boolean) {
    this.#snackBar.dismiss();
    confirm
      ? this.dialog.close(confirm)
      : this.dialog.close();
  }

  saveAndClose(confirm: boolean) {
    if (confirm) {
      this.#extensionsSvc.deleteExtension(this.extensionName, '', false, this.withData)
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
