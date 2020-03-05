import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { MatDialogRef } from '@angular/material/dialog';

import { ImportAppService } from '../../services/import-app.service';
import { ImportAppResult } from '../../models/import-app-result.model';

@Component({
  selector: 'app-import-app',
  templateUrl: './import-app.component.html',
  styleUrls: ['./import-app.component.scss']
})
export class ImportAppComponent implements OnInit, OnDestroy {
  isImporting = false;
  importFile: File;
  importResult: ImportAppResult;

  constructor(
    private dialogRef: MatDialogRef<ImportAppComponent>,
    private importAppService: ImportAppService,
  ) { }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.closeDialog();
  }

  importApp(changedName?: string) {
    this.isImporting = true;

    this.importAppService.importApp(this.importFile, changedName).subscribe({
      next: result => {
        this.isImporting = false;

        this.importResult = result;
        // The app could not be installed because the app-folder already exists. Install app in a different folder?
        if (this.importResult && this.importResult.Messages && this.importResult.Messages[0]
          && this.importResult.Messages[0].MessageType === 0) {
          const folderName = prompt(this.importResult.Messages[0].Text + ' Would you like to install it using another folder name?');
          if (folderName) {
            this.importApp(folderName);
          }
        }
      },
      error: (error: HttpErrorResponse) => {
        this.isImporting = false;
      },
    });
  }

  fileChange(event: Event) {
    this.importFile = (<HTMLInputElement>event.target).files[0];
  }

  closeDialog() {
    this.importFile = null;
    if (this.dialogRef) {
      this.dialogRef.close();
      this.dialogRef = null;
    }
  }
}
