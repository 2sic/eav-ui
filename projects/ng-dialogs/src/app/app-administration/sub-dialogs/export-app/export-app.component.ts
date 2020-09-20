import { Component, OnInit, HostBinding, ChangeDetectionStrategy, OnDestroy, NgZone } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { MatDialogRef } from '@angular/material/dialog';
import { BehaviorSubject, combineLatest, fromEvent, Subscription } from 'rxjs';
import { map, take } from 'rxjs/operators';

import { AppInfo } from '../../models/app-info.model';
import { ExportAppService } from '../../services/export-app.service';

@Component({
  selector: 'app-export-app',
  templateUrl: './export-app.component.html',
  styleUrls: ['./export-app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExportAppComponent implements OnInit, OnDestroy {
  @HostBinding('className') hostClass = 'dialog-component';

  includeContentGroups = false;
  resetAppGuid = false;
  private appInfo$ = new BehaviorSubject<AppInfo>(null);
  private isExporting$ = new BehaviorSubject(false);
  templateVars$ = combineLatest([this.appInfo$, this.isExporting$]).pipe(
    map(([appInfo, isExporting]) => ({ appInfo, isExporting })),
  );

  private subscription = new Subscription();

  constructor(private dialogRef: MatDialogRef<ExportAppComponent>, private exportAppService: ExportAppService, private zone: NgZone) { }

  ngOnInit() {
    this.exportAppService.getAppInfo().subscribe(appInfo => {
      this.appInfo$.next(appInfo);
    });
  }

  ngOnDestroy() {
    this.appInfo$.complete();
    this.isExporting$.complete();
    this.subscription.unsubscribe();
  }

  closeDialog() {
    this.dialogRef.close();
  }

  exportApp() {
    this.isExporting$.next(true);
    const exportAppWindow = this.exportAppService.exportApp(this.includeContentGroups, this.resetAppGuid);
    this.subscription.add(
      fromEvent(exportAppWindow, 'load').pipe(take(1)).subscribe(event => {
        this.zone.run(() => { this.isExporting$.next(false); });
      })
    );
  }

  exportGit() {
    this.isExporting$.next(true);
    this.exportAppService.exportForVersionControl(this.includeContentGroups, this.resetAppGuid).subscribe({
      next: res => {
        this.isExporting$.next(false);
        alert('Done - please check your \'.data\' folder');
      },
      error: (error: HttpErrorResponse) => {
        this.isExporting$.next(false);
      },
    });
  }
}
