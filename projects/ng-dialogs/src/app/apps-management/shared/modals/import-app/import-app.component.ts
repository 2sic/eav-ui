import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { ImportAppService } from '../../services/import-app.service';
import { ImportAppDialogData } from '../../models/import-app-dialog-data.model';
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
    @Inject(MAT_DIALOG_DATA) public importAppDialogData: ImportAppDialogData,
    private importAppService: ImportAppService,
  ) { }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.closeDialog();
  }

  importApp(changedName?: string) {
    this.isImporting = true;

    this.importAppService.importApp(this.importFile, changedName,
      this.importAppDialogData.context.appId, this.importAppDialogData.context.zoneId)
      .subscribe((result: ImportAppResult) => {
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
      });
  }

  fileChange(event: Event) {
    this.importFile = (event.target as HTMLInputElement).files[0];
  }

  closeDialog() {
    this.importFile = null;
    this.dialogRef.close();
    this.dialogRef = null;
  }
}
