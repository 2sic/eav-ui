import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { MatDialogRef } from '@angular/material/dialog';

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
    // spm TODO: figure out how to capture window loading to disable export button
    this.isExporting = true;
    this.exportAppService.exportApp(this.includeContentGroups, this.resetAppGuid);
    this.isExporting = false;
  }

  exportGit() {
    this.isExporting = true;
    this.exportAppService.exportForVersionControl(this.includeContentGroups, this.resetAppGuid).subscribe({
      next: res => {
        this.isExporting = false;
        alert('Done - please check your \'.data\' folder');
      },
      error: (error: HttpErrorResponse) => {
        this.isExporting = false;
      },
    });
  }

  closeDialog() {
    this.dialogRef.close();
  }
}
