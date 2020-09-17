import { Component, OnInit, HostBinding, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { MatDialogRef } from '@angular/material/dialog';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

import { ImportAppService } from './services/import-app.service';
import { ImportAppResult } from './models/import-app-result.model';

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

  constructor(private dialogRef: MatDialogRef<ImportAppComponent>, private importAppService: ImportAppService) { }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.isImporting$.complete();
    this.importFile$.complete();
    this.importResult$.complete();
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
          if (folderName) {
            this.importApp(folderName);
          }
        }
      },
      error: (error: HttpErrorResponse) => {
        this.isImporting$.next(false);
      },
    });
  }

  fileChange(event: Event) {
    const importFile = (event.target as HTMLInputElement).files[0];
    this.importFile$.next(importFile);
  }

  closeDialog() {
    this.dialogRef.close();
  }
}
