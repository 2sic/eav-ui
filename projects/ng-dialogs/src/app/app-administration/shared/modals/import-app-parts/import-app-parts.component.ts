import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { MatDialogRef } from '@angular/material/dialog';

import { ImportAppPartsService } from '../../services/import-app-parts.service';
import { ImportAppPartsResult } from '../../models/import-app-parts.model';

@Component({
  selector: 'app-import-app-parts',
  templateUrl: './import-app-parts.component.html',
  styleUrls: ['./import-app-parts.component.scss']
})
export class ImportAppPartsComponent implements OnInit {
  importFile: File;
  isImporting = false;
  importResult: ImportAppPartsResult;

  constructor(private dialogRef: MatDialogRef<ImportAppPartsComponent>, private importAppPartsService: ImportAppPartsService) { }

  ngOnInit() {
  }

  fileChange(event: Event) {
    this.importFile = (<HTMLInputElement>event.target).files[0];
  }

  importAppParts() {
    this.isImporting = true;
    this.importAppPartsService.importAppParts(this.importFile).subscribe({
      next: result => {
        this.importResult = result;
        this.isImporting = false;
      },
      error: (error: HttpErrorResponse) => {
        this.isImporting = false;
      },
    });
  }

  closeDialog() {
    this.dialogRef.close();
  }
}
