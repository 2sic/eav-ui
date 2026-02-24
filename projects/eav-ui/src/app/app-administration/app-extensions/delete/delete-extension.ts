import { Component, computed, inject, Inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogRef } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { transient } from 'projects/core';
import { isCtrlEnter } from '../../../edit/dialog/main/keyboard-shortcuts';
import { DialogHeaderComponent } from "../../../shared/dialog-header/dialog-header";
import { SaveCloseButtonFabComponent } from '../../../shared/modules/save-close-button-fab/save-close-button-fab';
import { ConfirmDeleteDialogComponent } from '../../sub-dialogs/confirm-delete-dialog/confirm-delete-dialog';
import { ConfirmDeleteDialogData } from '../../sub-dialogs/confirm-delete-dialog/confirm-delete-dialog.models';
import { AppExtensionsService } from '../app-extensions.service';
import { InspectExtensionComponent } from '../inspect/inspect-extension-content';

@Component({
  templateUrl: './delete-extension.html',
  styleUrls: ['./delete-extension.scss'],
  imports: [
    MatButtonModule,
    MatIconModule,
    MatDialogActions,
    SaveCloseButtonFabComponent,
    MatSlideToggleModule,
    FormsModule,
    MatExpansionModule,
    InspectExtensionComponent,
    DialogHeaderComponent
]
})
export class DeleteExtensionComponent implements OnInit {
  #snackBar = inject(MatSnackBar);
  #extensionsSvc = transient(AppExtensionsService);

  extensionFolder = this.route.snapshot.paramMap.get('extension') as 'extension';
  edition = this.route.snapshot.queryParamMap.get('edition') || '';
  withData = false;
  forceDelete = false;

  preflightResult = this.#extensionsSvc.preflightExtension(this.extensionFolder, this.edition).value;
  totalLocalEntities = computed(() => {
    const result = this.preflightResult();
    if (!result?.data?.contentTypes) return 0;

    return result.data.contentTypes
      .map(ct => ct.localEntities)
      .reduce((sum, n) => sum + n, 0);
  });

  mustForceDelete = computed((): boolean => {
    const inspect = this.preflightResult()
    if (!inspect) return false;

    const fileSummary = inspect.summary;
    const filesChanged = fileSummary.changed + fileSummary.added + fileSummary.missing;

    // 1) Installed?
    const isInstalled = inspect.files.some(f =>
      f.path.endsWith('App_Data/extension.json') && f.status !== 'missing'
    );

    // If not installed → auto-force-delete
    if (!isInstalled) {
      return true;
    }

    // 2) Lock file must exist
    if (!inspect.foundLock) {
      this.showError('Missing extension.lock.json. Deletion not allowed.');
      return true;
    }

    // 3) Changed / added / missing files?
    if (filesChanged > 0) {
      this.askForce(`The extension has file changes (${filesChanged}).`);
      return true;
    }

    // 4) Existing local entities?
    if (this.totalLocalEntities() > 0) {
      this.askForce(`The extension has ${this.totalLocalEntities()} local entities.`);
      return true;
    }

    // 5) All good → normal delete
    return false;
  });

  constructor(
    private route: ActivatedRoute,
    @Inject(MAT_DIALOG_DATA) public dialogData: ConfirmDeleteDialogData,
    public dialog: MatDialogRef<ConfirmDeleteDialogComponent>,
  ) { }

  ngOnInit() {
    this.#watchKeyboardShortcuts();
  }

  #watchKeyboardShortcuts(): void {
    this.dialog.keydownEvents().subscribe(event => {
      if (isCtrlEnter(event)) {
        event.preventDefault();
        this.deleteAndClose();
      }
    });
  }

  closeDialog(confirm?: boolean) {
    this.#snackBar.dismiss();
    confirm
      ? this.dialog.close(confirm)
      : this.dialog.close();
  }

  deleteAndClose() {
    if (this.mustForceDelete() && !this.forceDelete) {
      this.showError('Deletion requires force. Please enable "Force Delete" and try again.');
      return;
    }
    this.executeDelete(this.forceDelete);
  }

  private askForce(message: string) {
    this.#snackBar.open(
      `${message}`,
      '',
      { duration: 10000 }
    );
  }

  private executeDelete(force: boolean) {
    this.#extensionsSvc
      .deleteExtension(this.extensionFolder, this.edition, force, this.withData)
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
