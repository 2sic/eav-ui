import { Component, HostBinding, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef, MatDialogActions } from '@angular/material/dialog';
import { BehaviorSubject, combineLatest, map } from 'rxjs';
import { AppInfo } from '../../models/app-info.model';
import { ExportAppService } from '../../services/export-app.service';
import { AsyncPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
    selector: 'app-export-app',
    templateUrl: './export-app.component.html',
    styleUrls: ['./export-app.component.scss'],
    standalone: true,
    imports: [
        MatProgressSpinnerModule,
        MatCheckboxModule,
        FormsModule,
        MatDialogActions,
        MatButtonModule,
        AsyncPipe,
    ],
})
export class ExportAppComponent implements OnInit, OnDestroy {
  @HostBinding('className') hostClass = 'dialog-component';

  includeContentGroups = false;
  resetAppGuid = false;
  private appInfo$ = new BehaviorSubject<AppInfo>(null);
  private isExporting$ = new BehaviorSubject(false);
  viewModel$ = combineLatest([this.appInfo$, this.isExporting$]).pipe(
    map(([appInfo, isExporting]) => ({ appInfo, isExporting })),
  );

  constructor(private dialogRef: MatDialogRef<ExportAppComponent>, private exportAppService: ExportAppService) { }

  ngOnInit() {
    this.exportAppService.getAppInfo().subscribe(appInfo => {
      this.appInfo$.next(appInfo);
    });
  }

  ngOnDestroy() {
    this.appInfo$.complete();
    this.isExporting$.complete();
  }

  closeDialog() {
    this.dialogRef.close();
  }

  exportApp() {
    this.isExporting$.next(true);
    this.exportAppService.exportApp(this.includeContentGroups, this.resetAppGuid);
    this.isExporting$.next(false);
  }
}
