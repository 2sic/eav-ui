import { HttpErrorResponse } from '@angular/common/http';
import { Component, HostBinding, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { ImportAppResult } from '../../../import-app/models/import-app-result.model';
import { PipelinesService } from '../../services/pipelines.service';
import { ImportQueryDialogData } from './import-query-dialog.config';

@Component({
  selector: 'app-import-query',
  templateUrl: './import-query.component.html',
  styleUrls: ['./import-query.component.scss'],
})
export class ImportQueryComponent implements OnInit, OnDestroy {
  @HostBinding('className') hostClass = 'dialog-component';

  private isImporting$ = new BehaviorSubject(false);
  private importFile$ = new BehaviorSubject<File>(null);
  private importResult$ = new BehaviorSubject<ImportAppResult>(null);
  templateVars$ = combineLatest([this.isImporting$, this.importFile$, this.importResult$]).pipe(
    map(([isImporting, importFile, importResult]) => ({ isImporting, importFile, importResult })),
  );

  constructor(
    @Inject(MAT_DIALOG_DATA) private dialogData: ImportQueryDialogData,
    private dialogRef: MatDialogRef<ImportQueryComponent>,
    private pipelinesService: PipelinesService,
    private snackBar: MatSnackBar,
  ) { }

  ngOnInit() {
    if (this.dialogData.files != null) {
      this.importFile$.next(this.dialogData.files[0]);
      this.importQuery();
    }
  }

  ngOnDestroy() {
    this.isImporting$.complete();
    this.importFile$.complete();
    this.importResult$.complete();
  }

  closeDialog() {
    this.dialogRef.close();
  }

  filesDropped(files: File[]) {
    const importFile = files[0];
    this.importFile$.next(importFile);
    this.importResult$.next(null);
    this.importQuery();
  }

  fileChange(event: Event) {
    const importFile = (event.target as HTMLInputElement).files[0];
    this.importFile$.next(importFile);
    this.importResult$.next(null);
  }

  importQuery() {
    this.isImporting$.next(true);
    this.pipelinesService.importQuery(this.importFile$.value).subscribe({
      next: result => {
        this.isImporting$.next(false);
        this.importResult$.next({
          Success: true,
          Messages: [],
        });
      },
      error: (error: HttpErrorResponse) => {
        this.isImporting$.next(false);
        this.importResult$.next(null);
        this.snackBar.open('Import failed. Please check console for more information', null, { duration: 3000 });
      },
    });
  }
}
