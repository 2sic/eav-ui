import { CommonModule } from '@angular/common';
import { Component, Inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { transient } from 'projects/core';
import { Observable, take } from 'rxjs';
import { FileUploadResult, UploadTypes } from '../../../shared/components/file-upload-dialog';
import { DragAndDropDirective } from '../../../shared/directives/drag-and-drop.directive';
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
  templateUrl: './import-extension.component.html',
  styleUrls: ['./import-extension.component.scss'],
  imports: [
    CommonModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatChipsModule,
    MatCardModule,
    DragAndDropDirective,
  ]
})
export class ImportExtensionComponent {
  private extensionSvc = transient(AppExtensionsService);

  uploadType = UploadTypes.Extension;

  // State signals
  file = signal<File | null>(null);
  preflightData = signal<any>(null);
  isLoadingPreflight = signal(false);
  isInstalling = signal(false);
  preflightError = signal<string | null>(null);

  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogData: FileUploadDialogData,
    private dialogRef: MatDialogRef<ImportExtensionComponent>
  ) {
    dialogData.title ??= `Import Extension`;
    dialogData.description ??= `Select Extension folder from your computer to import. `;
    dialogData.allowedFileTypes ??= 'zip';
    dialogData.multiple ??= true;

    // Check if files were passed via dialogData (from drag-drop on main component)
    if (dialogData.file) {
      this.file.set(dialogData.file);
      this.runPreflight(dialogData.file);
    }
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

  private runPreflight(files: File): void {
    this.isLoadingPreflight.set(true);
    this.preflightError.set(null);
    this.preflightData.set(null);

    this.extensionSvc.installPreflightExtension([this.file()]).pipe(take(1)).subscribe({
      next: (result) => {
        this.isLoadingPreflight.set(false);
        this.preflightData.set(result);
      },
      error: (error) => {
        this.isLoadingPreflight.set(false);
        this.preflightError.set(error?.message || 'Preflight check failed');
        console.error('Preflight error:', error);
      }
    });
  }

  install(): void {
    if (!this.file()) return;

    this.isInstalling.set(true);

    this.extensionSvc.uploadExtensions(this.file()).pipe(take(1)).subscribe({
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

  cancel(): void {
    this.dialogRef.close(false);
  }
}