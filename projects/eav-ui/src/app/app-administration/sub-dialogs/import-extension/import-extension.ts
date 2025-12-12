import { CommonModule } from '@angular/common';
import { Component, inject, Inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { DomSanitizer } from '@angular/platform-browser';
import { transient } from 'projects/core';
import { Observable, take } from 'rxjs';
import { isCtrlEnter } from '../../../edit/dialog/main/keyboard-shortcuts';
import { FileUploadResult, UploadTypes } from '../../../shared/components/file-upload-dialog';
import { DragAndDropDirective } from '../../../shared/directives/drag-and-drop.directive';
import { TippyDirective } from '../../../shared/directives/tippy.directive';
import { ExtensionEdition, ExtensionPreflightItem } from '../../models/extension.model';
import { AppExtensionsService } from '../../services/app-extensions.service';

export interface FileUploadDialogData {
  title?: string;
  description?: string;
  allowedFileTypes?: string;
  file?: File;
  multiple?: boolean;
  // upload$?(files: File[]): Observable<FileUploadResult>;
  upload$?(files: File[], name?: string): Observable<FileUploadResult>;
}

@Component({
  selector: 'app-import-extension',
  templateUrl: './import-extension.html',
  styleUrls: ['./import-extension.scss'],
  imports: [
    CommonModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatChipsModule,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    DragAndDropDirective,
    MatIconModule,
    TippyDirective,
  ],
})
export class ImportExtensionComponent implements OnInit{
  private extensionSvc = transient(AppExtensionsService);

  uploadType = UploadTypes.Extension;
  remoteInstallerUrl = '';

  // TODO: @2pp - Replace debugging vars when backend is ready
  private readonly fallbackEditions = ['staging', 'live'];

  // State signals
  file = signal<File | null>(null);
  extension = signal<ExtensionPreflightItem | null>(null);
  isLoadingPreflight = signal(false);
  isInstalling = signal(false);
  preflightError = signal<string | null>(null);
  editions = signal<ExtensionEdition[]>([]);
  showExtensionCatalog = signal(false);
    private sanitizer = inject(DomSanitizer);

  // Selected editions for installation
  selectedEditions: string = '';

  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogData: FileUploadDialogData,
    private dialogRef: MatDialogRef<ImportExtensionComponent>
  ) {
    dialogData.title ??= `Import Extension`;
    dialogData.description ??= `Select Extension folder from your computer to import.  `;
    dialogData.allowedFileTypes ??= 'zip';
    dialogData.multiple ??= true;

    // Check if files were passed via dialogData (from drag-drop on main component)
    if (dialogData.file) {
      this.file.set(dialogData.file);
      this.runPreflight(dialogData.file);
    }
    
    this.remoteInstallerUrl = <string>this.sanitizer.bypassSecurityTrustResourceUrl('') // (settings.remoteUrl);
  }

  ngOnInit() {
    this.#watchKeyboardShortcuts();
  }

  #watchKeyboardShortcuts(): void {
    this.dialogRef.keydownEvents().subscribe(event => {
      if (isCtrlEnter(event)) {
        event.preventDefault();
        this.install();
      }
    });
  }

  filesDropped(droppedFiles: File[]): void {
    this.file.set(droppedFiles[0]);
    this.runPreflight(droppedFiles[0]);
  }

  filesChanged(event: Event): void {
    const file = (event.target as HTMLInputElement).files[0];
    this.file.set(file);
    this.runPreflight(file);
  }

  toggleShowExtensionCatalog(): void {
    this.showExtensionCatalog.set(!this.showExtensionCatalog());
  }

  private runPreflight(file: File): void {
    this.isLoadingPreflight.set(true);

    this.extensionSvc.installPreflightExtension([file])
      .pipe(take(1))
      .subscribe({
        next: (result) => {
          this.isLoadingPreflight.set(false);
          const ext = result.extensions[0];
          this.extension.set(ext);


          if (ext.editions?.length > 0) {
            this.editions.set(ext.editions);
          } else {
            this.editions.set(
              this.fallbackEditions.map(e => ({ edition: e }))
            );
          }

          this.selectedEditions = this.editions().map(e => e.edition).join(',');
        },
        error: (error) => {
          this.isLoadingPreflight.set(false);
          this.preflightError.set(error?.message || 'Preflight check failed');
        }
      });
  }

  canSave(): boolean {
    if (!this.file()) return false;
    if (this.preflightError()) return false;
    if (this.isInstalling()) return false;
    if (this.isLoadingPreflight()) return false;
    if (!this.extension()) return false;

    return true;
  }

  install(): void {
    if (!this.file()) return;

    this.isInstalling.set(true);

    // Pass selected edition as an array parameter if available
    const editions = this.selectedEditions?.length ? this.selectedEditions : undefined;

    this.extensionSvc.uploadExtensions(this.file(), editions).pipe(take(1)).subscribe({
      next: (result) => {
        this.isInstalling.set(false);
        this.dialogRef.close(true); // Close and refresh parent
      },
      error: (error) => {
        this.isInstalling.set(false);
        this.preflightError.set(error?.message || 'Installation failed');
        console.error('Installation error:', error);
      }
    });
  }

  closeDialog(): void {
    this.dialogRef.close(false);
  }
}