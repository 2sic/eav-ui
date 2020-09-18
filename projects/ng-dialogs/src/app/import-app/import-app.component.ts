import { Component, OnInit, HostBinding, ChangeDetectionStrategy, OnDestroy, Inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

import { ImportAppService } from './services/import-app.service';
import { ImportAppResult } from './models/import-app-result.model';
import { ImportAppDialogData } from './import-app-dialog.config';

@Component({
  selector: 'app-import-app',
  templateUrl: './import-app.component.html',
  styleUrls: ['./import-app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImportAppComponent implements OnInit, OnDestroy {
  @HostBinding('className') hostClass = 'dialog-component';

  private isImporting$ = new BehaviorSubject(false);
  private importFile$ = new BehaviorSubject<File>(null);
  private importResult$ = new BehaviorSubject<ImportAppResult>(null);
  templateVars$ = combineLatest([this.isImporting$, this.importFile$, this.importResult$]).pipe(
    map(([isImporting, importFile, importResult]) => ({ isImporting, importFile, importResult })),
  );

  constructor(
    @Inject(MAT_DIALOG_DATA) private dialogData: ImportAppDialogData,
    private dialogRef: MatDialogRef<ImportAppComponent>,
    private importAppService: ImportAppService,
  ) { }

  ngOnInit() {
    if (this.dialogData.files != null) {
      this.importFile$.next(this.dialogData.files[0]);
      this.importApp();
    }
  }

  ngOnDestroy() {
    this.isImporting$.complete();
    this.importFile$.complete();
    this.importResult$.complete();
  }

  filesDropped(files: FileList) {
    const importFile = files[0];
    this.importFile$.next(importFile);
    this.importResult$.next(null);
    this.importApp();
  }

  fileChange(event: Event) {
    const importFile = (event.target as HTMLInputElement).files[0];
    this.importFile$.next(importFile);
    this.importResult$.next(null);
  }

  importApp(changedName?: string) {
    this.isImporting$.next(true);
    this.importAppService.importApp(this.importFile$.value, changedName).subscribe({
      next: result => {
        this.isImporting$.next(false);
        this.importResult$.next(result);
        // The app could not be installed because the app-folder already exists. Install app in a different folder?
        if (this.importResult$.value?.Messages?.[0]?.MessageType === 0) {
          const folderName = prompt(this.importResult$.value.Messages[0].Text + ' Would you like to install it using another folder name?');
          if (!folderName) { return; }
          this.importApp(folderName);
        }
      },
      error: (error: HttpErrorResponse) => {
        this.isImporting$.next(false);
        this.importResult$.next({
          Succeeded: false,
          Messages: [{ Text: error.error.ExceptionMessage, MessageType: 2 }],
        });
      },
    });
  }

  closeDialog() {
    this.dialogRef.close();
  }
}
