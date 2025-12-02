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
import { ExtensionInspectResult } from '../../models/extension.model';
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
  withForceAllowed = false;

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
    if (!confirm) {
      this.dialog.close(false);
      return;
    }

    this.performPreflight();
  }

  private performPreflight() {
    this.#extensionsSvc.inspectExtension(this.extensionFolder, '')
      .subscribe({
        next: inspect => this.evaluatePreflight(inspect),
        error: () => this.showError('Preflight check failed.')
      });
  }

  private evaluatePreflight(inspect: ExtensionInspectResult) {

    const fileSummary = inspect.summary;
    const filesChanged = fileSummary.changed + fileSummary.added + fileSummary.missing;

    // 1) Installed?
    const isInstalled = inspect.files.some(f =>
      f.path.endsWith('App_Data/extension.json') && f.status !== 'missing'
    );

    // If not installed → auto-force-delete
    if (!isInstalled) {
      this.executeDelete(true);
      return;
    }

    // 2) Lock file must exist
    if (!inspect.foundLock) {
      this.showError('Missing extension.lock.json. Deletion not allowed.');
      return;
    }

    // 3) Changed / added / missing files?
    if (filesChanged > 0 && !this.withForceAllowed) {
      this.askForce(`The extension has file changes (${filesChanged}).`);
      return;
    }

    // 4) Existing data?
    const dataCount = inspect.data.contentTypes.length;
    if (dataCount > 0 && !this.withForceAllowed) {
      this.askForce(`The extension has data (${dataCount} items).`);
      return;
    }

    // 5) All good → normal delete
    this.executeDelete(false);
  }


  private askForce(message: string) {
    const snack = this.#snackBar.open(
      message + ' Force delete?',
      'Force',
      { duration: 10000 }
    );

    snack.onAction().subscribe(() =>
      this.executeDelete(true)
    );
  }

  private executeDelete(force: boolean) {
    this.#extensionsSvc
      .deleteExtension(this.extensionFolder, '', force, this.withData)
      .subscribe({
        next: () => {
          this.#snackBar.open('Extension deleted successfully', 'OK', { duration: 3000 });
          this.dialog.close(true);
        },
        error: err => {
          const msg = err?.error?.exceptionMessage ?? 'Delete failed.';
          this.showError(msg);
        }
      });
  }

  private showError(msg: string) {
    this.#snackBar.open(msg, 'OK', { duration: 8000 });
  }
}
