import { Component, OnInit, HostBinding, OnDestroy, Inject, ChangeDetectionStrategy } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

import { ContentItemsService } from '../../services/content-items.service';
import { ImportAppResult } from '../../../import-app/models/import-app-result.model';
import { ImportAppDialogData } from '../../../import-app/import-app-dialog.config';

@Component({
  selector: 'app-content-item-import',
  templateUrl: './content-item-import.component.html',
  styleUrls: ['./content-item-import.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContentItemImportComponent implements OnInit, OnDestroy {
  @HostBinding('className') hostClass = 'dialog-component';

  private isImporting$ = new BehaviorSubject(false);
  private importFile$ = new BehaviorSubject<File>(null);
  private importResult$ = new BehaviorSubject<ImportAppResult>(null);
  templateVars$ = combineLatest([this.isImporting$, this.importFile$, this.importResult$]).pipe(
    map(([isImporting, importFile, importResult]) => ({ isImporting, importFile, importResult })),
  );

  constructor(
    @Inject(MAT_DIALOG_DATA) private dialogData: ImportAppDialogData,
    private dialogRef: MatDialogRef<ContentItemImportComponent>,
    private contentItemsService: ContentItemsService,
  ) { }

  ngOnInit() {
    if (this.dialogData.files != null) {
      this.importFile$.next(this.dialogData.files[0]);
      this.importContentItem();
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

  filesDropped(files: FileList) {
    const importFile = files[0];
    this.importFile$.next(importFile);
    this.importResult$.next(null);
    this.importContentItem();
  }

  fileChange(event: Event) {
    const importFile = (event.target as HTMLInputElement).files[0];
    this.importFile$.next(importFile);
    this.importResult$.next(null);
  }

  importContentItem() {
    this.isImporting$.next(true);
    this.contentItemsService.importItem(this.importFile$.value).subscribe({
      next: res => {
        this.isImporting$.next(false);
        this.importResult$.next({
          Succeeded: true,
          Messages: [],
        });
      },
      error: (error: HttpErrorResponse) => {
        this.isImporting$.next(false);
        this.importResult$.next({
          Succeeded: false,
          Messages: [{ Text: error.error.ExceptionMessage, MessageType: 2 }],
        });
      }
    });
  }
}
