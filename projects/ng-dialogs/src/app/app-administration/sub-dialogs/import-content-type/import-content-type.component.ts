import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, HostBinding, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { ImportAppResult } from '../../../import-app/models/import-app-result.model';
import { ContentTypesService } from '../../services/content-types.service';
import { ImportContentTypeDialogData } from './import-content-type-dialog.config';

@Component({
  selector: 'app-import-content-type',
  templateUrl: './import-content-type.component.html',
  styleUrls: ['./import-content-type.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImportContentTypeComponent implements OnInit, OnDestroy {
  @HostBinding('className') hostClass = 'dialog-component';

  private isImporting$ = new BehaviorSubject(false);
  private importFiles$ = new BehaviorSubject<File[]>(null);
  private importResult$ = new BehaviorSubject<ImportAppResult>(null);
  templateVars$ = combineLatest([this.isImporting$, this.importFiles$, this.importResult$]).pipe(
    map(([isImporting, importFiles, importResult]) => ({ isImporting, importFiles, importResult })),
  );

  constructor(
    @Inject(MAT_DIALOG_DATA) private dialogData: ImportContentTypeDialogData,
    private dialogRef: MatDialogRef<ImportContentTypeComponent>,
    private contentTypesService: ContentTypesService,
    private snackBar: MatSnackBar,
  ) { }

  ngOnInit() {
    if (this.dialogData.files != null) {
      this.importFiles$.next(this.dialogData.files);
      this.importContentType();
    }
  }

  ngOnDestroy() {
    this.isImporting$.complete();
    this.importFiles$.complete();
    this.importResult$.complete();
  }

  closeDialog() {
    this.dialogRef.close();
  }

  filesDropped(files: File[]) {
    this.importFiles$.next(files);
    this.importResult$.next(null);
    this.importContentType();
  }

  filesChange(event: Event) {
    const fileList = (event.target as HTMLInputElement).files;
    const files = fileList.length > 0 ? Array.from(fileList) : null;
    this.importFiles$.next(files);
    this.importResult$.next(null);
  }

  importContentType() {
    this.isImporting$.next(true);
    this.contentTypesService.import(this.importFiles$.value).subscribe({
      next: result => {
        this.isImporting$.next(false);
        this.importResult$.next(result);
      },
      error: (error: HttpErrorResponse) => {
        this.isImporting$.next(false);
        this.importResult$.next(null);
        this.snackBar.open('Import failed. Please check console for more information', null, { duration: 3000 });
      },
    });
  }
}
