import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { MatDialogRef } from '@angular/material/dialog';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { AppInfo } from '../../models/app-info.model';
import { ExportAppService } from '../../services/export-app.service';

@Component({
  selector: 'app-export-app',
  templateUrl: './export-app.component.html',
  styleUrls: ['./export-app.component.scss']
})
export class ExportAppComponent implements OnInit {
  appInfo: AppInfo;
  includeContentGroups = false;
  resetAppGuid = false;
  isExporting = false;

  constructor(private dialogRef: MatDialogRef<ExportAppComponent>, private exportAppService: ExportAppService) { }

  ngOnInit() {
    this.exportAppService.getAppInfo().subscribe(appInfo => {
      this.appInfo = appInfo;
    });
  }

  exportApp() {
    this.exportAppService.exportApp(this.includeContentGroups, this.resetAppGuid);
  }

  exportGit() {
    this.isExporting = true;
    this.exportAppService.exportForVersionControl(this.includeContentGroups, this.resetAppGuid)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          this.isExporting = false;
          return throwError(error);
        }),
      ).subscribe(res => {
        this.isExporting = false;
        alert('Done - please check your \'.data\' folder');
      });
  }

  closeDialog() {
    this.dialogRef.close();
  }
}
