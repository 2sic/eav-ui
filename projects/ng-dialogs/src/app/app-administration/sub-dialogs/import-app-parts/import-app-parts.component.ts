import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, HostBinding, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { ImportAppResult } from '../../../import-app/models/import-app-result.model';
import { ImportAppPartsService } from '../../services/import-app-parts.service';
import { ImportAppPartsDialogData } from './import-app-parts-dialog.config';

@Component({
  selector: 'app-import-app-parts',
  templateUrl: './import-app-parts.component.html',
  styleUrls: ['./import-app-parts.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImportAppPartsComponent implements OnInit, OnDestroy {
  @HostBinding('className') hostClass = 'dialog-component';

  private isImporting$ = new BehaviorSubject(false);
  private importFile$ = new BehaviorSubject<File>(null);
  private importResult$ = new BehaviorSubject<ImportAppResult>(null);
  templateVars$ = combineLatest([this.isImporting$, this.importFile$, this.importResult$]).pipe(
    map(([isImporting, importFile, importResult]) => ({ isImporting, importFile, importResult })),
  );

  constructor(
    @Inject(MAT_DIALOG_DATA) private dialogData: ImportAppPartsDialogData,
    private dialogRef: MatDialogRef<ImportAppPartsComponent>,
    private importAppPartsService: ImportAppPartsService,
  ) { }

  ngOnInit() {
    if (this.dialogData.files != null) {
      this.importFile$.next(this.dialogData.files[0]);
      this.importAppParts();
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
    this.importAppParts();
  }

  fileChange(event: Event) {
    const importFile = (event.target as HTMLInputElement).files[0];
    this.importFile$.next(importFile);
    this.importResult$.next(null);
  }

  importAppParts() {
    this.isImporting$.next(true);
    this.importAppPartsService.importAppParts(this.importFile$.value).subscribe({
      next: result => {
        this.isImporting$.next(false);
        this.importResult$.next(result);
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
}
