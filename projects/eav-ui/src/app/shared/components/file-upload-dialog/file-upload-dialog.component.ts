import { Component, HostBinding, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject, Observable, Subscription, combineLatest, map, take } from 'rxjs';
import { BaseSubsinkComponent } from '../base-subsink-component/base-subsink.component';
import { FileUploadDialogData, FileUploadMessageTypes, FileUploadResult } from './file-upload-dialog.models';

@Component({
  selector: 'app-file-upload-dialog',
  templateUrl: './file-upload-dialog.component.html',
  styleUrls: ['./file-upload-dialog.component.scss'],
})
export class FileUploadDialogComponent extends BaseSubsinkComponent implements OnInit, OnDestroy {
  @HostBinding('className') hostClass = 'dialog-component';

  uploading$ = new BehaviorSubject<boolean>(false);
  files$ = new BehaviorSubject<File[]>([]);
  result$ = new BehaviorSubject<FileUploadResult>(undefined);
  FileUploadMessageTypes = FileUploadMessageTypes;

  viewModel$: Observable<FileUploadDialogViewModel>;


  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogData: FileUploadDialogData,
    private dialogRef: MatDialogRef<FileUploadDialogComponent>,
    private snackBar: MatSnackBar,
  ) { 
    super();
  }

  ngOnInit(): void {
    this.subscription.add(
      this.files$.subscribe(() => {
        if (this.result$.value !== undefined) {
          this.result$.next(undefined);
        }
      }),
    );

    if (this.dialogData.files != null) {
      this.filesDropped(this.dialogData.files);
    }

    this.viewModel$ = combineLatest([
      this.uploading$, this.files$, this.result$,
    ]).pipe(map(([uploading, files, result]) => ({ uploading, files, result })));
  }

  ngOnDestroy(): void {
    this.uploading$.complete();
    this.files$.complete();
    this.result$.complete();
    super.ngOnDestroy();
  }

  closeDialog(refresh?: boolean): void {
    this.dialogRef.close(refresh);
  }

  filesDropped(files: File[]): void {
    this.setFiles(files);
    this.upload();
  }

  filesChanged(event: Event): void {
    const fileList = (event.target as HTMLInputElement).files;
    const files = Array.from(fileList);
    this.setFiles(files);
  }

  upload(): void {
    this.uploading$.next(true);
    this.subscription.add(
      this.dialogData.upload$(this.files$.value).pipe(take(1)).subscribe({
        next: (result) => {
          this.uploading$.next(false);
          this.result$.next(result);
        },
        error: () => {
          this.uploading$.next(false);
          this.result$.next(undefined);
          this.snackBar.open('Upload failed. Please check console for more information', undefined, { duration: 3000 });
        },
      }),
    );
  }

  private setFiles(files: File[]): void {
    if (!this.dialogData.multiple) {
      files = files.slice(0, 1);
    }
    this.files$.next(files);
  }
}

interface FileUploadDialogViewModel {
  uploading: boolean;
  files: File[];
  result: FileUploadResult;
}