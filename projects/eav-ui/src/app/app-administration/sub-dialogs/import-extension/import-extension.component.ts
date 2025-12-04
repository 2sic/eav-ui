import { CommonModule } from '@angular/common';
import { Component, Inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { transient } from 'projects/core';
import { take } from 'rxjs';
import { FileUploadDialogData, UploadTypes } from '../../../shared/components/file-upload-dialog';
import { AppExtensionsService } from '../../services/app-extensions.service';

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
  ]
})
export class ImportExtensionComponent {
  private extensionSvc = transient(AppExtensionsService);

  uploadType = UploadTypes.Extension;
  
  // State signals
  files = signal<File[]>([]);
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
  }

  filesDropped(droppedFiles: any): void {
    this.files.set(droppedFiles);
    this.runPreflight(droppedFiles);
  }

  filesChanged(event: Event): void {
    const fileList = (event.target as HTMLInputElement).files;
    const selectedFiles = Array.from(fileList);
    this.files.set(selectedFiles);
    this.runPreflight(selectedFiles);
  }

  private runPreflight(files: File[]): void {
    this.isLoadingPreflight.set(true);
    this.preflightError.set(null);
    this.preflightData.set(null);

    this.extensionSvc.installPreflightExtension(files).pipe(take(1)).subscribe({
      next: (result) => {
        this.isLoadingPreflight.set(false);
        this.preflightData.set(result);
      },
      error: (error) => {
        this.isLoadingPreflight.set(false);
        this.preflightError.set(error?. message || 'Preflight check failed');
        console.error('Preflight error:', error);
      }
    });
  }

  install(): void {
    if (!this.files()?.length) return;

    this.isInstalling.set(true);
    
    this.extensionSvc.uploadExtensions(this.files()). pipe(take(1)).subscribe({
      next: (result) => {
        this.isInstalling.set(false);
        this.dialogRef.close(true); // Close and refresh parent
      },
      error: (error) => {
        this. isInstalling.set(false);
        this.preflightError.set(error?.message || 'Installation failed');
        console. error('Installation error:', error);
      }
    });
  }

  cancel(): void {
    this.dialogRef.close(false);
  }
}