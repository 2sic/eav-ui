import { Component, OnInit, HostBinding, ChangeDetectionStrategy } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { MatDialogRef } from '@angular/material/dialog';
import { BehaviorSubject } from 'rxjs';

import { ImportAppService } from './services/import-app.service';
import { ImportAppResult } from './models/import-app-result.model';

@Component({
  selector: 'app-import-app',
  templateUrl: './import-app.component.html',
  styleUrls: ['./import-app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImportAppComponent implements OnInit {
  @HostBinding('className') hostClass = 'dialog-component';

  isImporting$ = new BehaviorSubject(false);
  importFile$ = new BehaviorSubject<File>(null);
  importResult$ = new BehaviorSubject<ImportAppResult>(null);

  constructor(private dialogRef: MatDialogRef<ImportAppComponent>, private importAppService: ImportAppService) { }

  ngOnInit() {
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
