import { ChangeDetectionStrategy, Component, HostBinding, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
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
