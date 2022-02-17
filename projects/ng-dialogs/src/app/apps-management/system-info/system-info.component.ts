import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AppDialogConfigService } from '../../app-administration/services';
import { copyToClipboard } from '../../shared/helpers/copy-to-clipboard.helper';
import { DialogContextSiteApp } from '../../shared/models/dialog-context.models';
import { EavWindow } from '../../shared/models/eav-window.model';
import { DialogService } from '../../shared/services/dialog.service';
import { SiteLanguage } from '../models/site-language.model';
import { SystemInfoSet } from '../models/system-info.model';
import { SxcInsightsService } from '../services/sxc-insights.service';
import { ZoneService } from '../services/zone.service';
import { InfoTemplate, SystemInfoTemplateVars } from './system-info.models';

declare const window: EavWindow;

@Component({
  selector: 'app-system-info',
  templateUrl: './system-info.component.html',
  styleUrls: ['./system-info.component.scss'],
})
export class SystemInfoComponent implements OnInit, OnDestroy {
  /*
    TODO:
    - use reactive form if possible
    - optimize html and css
  */
  pageLogDuration: number;
  positiveWholeNumber = /^[1-9][0-9]*$/;
  templateVars$: Observable<SystemInfoTemplateVars>;

  private systemInfoSet$: BehaviorSubject<SystemInfoSet | undefined>;
  private languages$: BehaviorSubject<SiteLanguage[] | undefined>;
  private loading$: BehaviorSubject<boolean>;
  private sitePrimaryApp: DialogContextSiteApp;
  private globalPrimaryApp: DialogContextSiteApp;

  constructor(
    private zoneService: ZoneService,
    private snackBar: MatSnackBar,
    private dialogService: DialogService,
    private appDialogConfigService: AppDialogConfigService,
    private sxcInsightsService: SxcInsightsService,
  ) { }

  ngOnInit(): void {
    this.systemInfoSet$ = new BehaviorSubject<SystemInfoSet | undefined>(undefined);
    this.languages$ = new BehaviorSubject<SiteLanguage[] | undefined>(undefined);
    this.loading$ = new BehaviorSubject<boolean>(false);

    this.buildTemplateVars();
    this.getSystemInfo();
    this.getLanguages();
  }

  ngOnDestroy(): void {
    this.systemInfoSet$.complete();
    this.languages$.complete();
    this.loading$.complete();
  }

  copyToClipboard(text: string): void {
    copyToClipboard(text);
    this.snackBar.open('Copied to clipboard', null, { duration: 2000 });
  }

  openSiteSettings(): void {
    if (this.sitePrimaryApp == null) {
      this.getDialogSettings(() => { this.openSiteSettings(); });
      return;
    }

    this.dialogService.openAppAdministration(this.sitePrimaryApp.ZoneId, this.sitePrimaryApp.AppId, 'app');
  }

  openGlobalSettings(): void {
    if (this.globalPrimaryApp == null) {
      this.getDialogSettings(() => { this.openGlobalSettings(); });
      return;
    }

    this.dialogService.openAppAdministration(this.globalPrimaryApp.ZoneId, this.globalPrimaryApp.AppId, 'app');
  }

  openInsights() {
    window.open(window.$2sxc.http.apiUrl('sys/insights/help'), '_blank');
  }

  activatePageLog(form: NgForm) {
    this.loading$.next(true);
    this.snackBar.open('Activating...');
    this.sxcInsightsService.activatePageLog(this.pageLogDuration).subscribe(res => {
      this.loading$.next(false);
      this.snackBar.open(res, null, { duration: 4000 });
    });
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    form.resetForm();
  }

  private getSystemInfo(): void {
    this.zoneService.getSystemInfo().subscribe({
      error: () => {
        this.systemInfoSet$.next(undefined);
      },
      next: (systemInfoSet) => {
        this.systemInfoSet$.next(systemInfoSet);
      },
    });
  }

  private getLanguages(): void {
    this.zoneService.getLanguages().subscribe({
      error: () => {
        this.languages$.next(undefined);
      },
      next: (languages) => {
        this.languages$.next(languages);
      },
    });
  }

  private getDialogSettings(callback: () => void): void {
    this.appDialogConfigService.getDialogSettings(0).subscribe(dialogSettings => {
      this.sitePrimaryApp = dialogSettings.Context.Site.PrimaryApp;
      this.globalPrimaryApp = dialogSettings.Context.System.PrimaryApp;
      callback();
    });
  }

  private buildTemplateVars(): void {
    const systemInfos$ = this.systemInfoSet$.pipe(
      map(systemInfoSet => {
        if (systemInfoSet == null) { return; }
        const info: InfoTemplate[] = [
          { label: 'CMS', value: `2sxc v.${systemInfoSet.System.EavVersion}` },
          { label: 'Platform', value: `${systemInfoSet.System.Platform} v.${systemInfoSet.System.PlatformVersion}` },
          { label: 'Zones', value: systemInfoSet.System.Zones.toString() },
          { label: 'Fingerprint', value: systemInfoSet.System.Fingerprint },
        ];
        return info;
      })
    );
    const siteInfos$ = combineLatest([this.systemInfoSet$, this.languages$]).pipe(
      map(([systemInfoSet, languages]) => {
        if (systemInfoSet == null || languages == null) { return; }
        const allLanguages = languages.length;
        const activeLanguages = languages.filter(l => l.IsEnabled).length;
        const info: InfoTemplate[] = [
          { label: 'Zone', value: systemInfoSet.Site.ZoneId.toString() },
          { label: 'Site', value: systemInfoSet.Site.SiteId.toString() },
          {
            label: 'Languages',
            value: `${activeLanguages}/${allLanguages}`,
            link: 'languages',
          },
          {
            label: 'Apps',
            value: systemInfoSet.Site.Apps.toString(),
            link: 'list',
          },
        ];
        return info;
      })
    );
    this.templateVars$ = combineLatest([systemInfos$, siteInfos$, this.loading$]).pipe(
      map(([systemInfos, siteInfos, loading]) => {
        const templateVars: SystemInfoTemplateVars = {
          systemInfos,
          siteInfos,
          loading,
        };
        return templateVars;
      }),
    );
  }
}
