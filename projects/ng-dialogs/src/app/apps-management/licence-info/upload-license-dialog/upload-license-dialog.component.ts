import { Component, HostBinding, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject } from 'rxjs';
import { FeaturesConfigService } from '../../services/features-config.service';

@Component({
  selector: 'app-upload-license-dialog',
  templateUrl: './upload-license-dialog.component.html',
  styleUrls: ['./upload-license-dialog.component.scss'],
})
export class UploadLicenseDialogComponent implements OnInit, OnDestroy {
  @HostBinding('className') hostClass = 'dialog-component';

  loading$ = new BehaviorSubject(false);
  importFile: File;

  constructor(
    private dialogRef: MatDialogRef<UploadLicenseDialogComponent>,
    private featuresConfigService: FeaturesConfigService,
    private snackBar: MatSnackBar,
  ) { }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.loading$.complete();
  }

  closeDialog(refresh?: boolean): void {
    this.dialogRef.close(refresh);
  }

  filesDropped(files: File[]): void {
    this.importFile = files[0];
  }

  fileChange(event: Event): void {
    this.importFile = (event.target as HTMLInputElement).files[0];
  }

  upload(): void {
    this.loading$.next(true);
    this.snackBar.open('Uploading license...');
    this.featuresConfigService.uploadLicense(this.importFile).subscribe({
      error: () => {
        this.loading$.next(false);
        this.snackBar.open('Failed to upload license. Please check console for more information', undefined, { duration: 3000 });
      },
      next: (info) => {
        const message = `License ${info.Success ? 'uploaded' : 'upload failed'}: ${info.Message}`;
        const duration = info.Success ? 3000 : 10000;
        const panelClass = info.Success ? undefined : 'snackbar-error';
        this.snackBar.open(message, undefined, { duration, panelClass });
        this.closeDialog(true);
      },
    });
  }
}
