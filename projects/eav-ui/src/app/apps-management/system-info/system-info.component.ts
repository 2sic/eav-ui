import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, combineLatest, map, Observable } from 'rxjs';
import { DialogSettings } from '../../app-administration/models';
import { BaseComponent } from '../../shared/components/base-component/base.component';
import { copyToClipboard } from '../../shared/helpers/copy-to-clipboard.helper';
import { EavWindow } from '../../shared/models/eav-window.model';
import { DialogService } from '../../shared/services/dialog.service';
import { SiteLanguage } from '../models/site-language.model';
import { SystemInfoSet } from '../models/system-info.model';
import { SxcInsightsService } from '../services/sxc-insights.service';
import { ZoneService } from '../services/zone.service';
import { GoToRegistration } from '../sub-dialogs/registration/go-to-registration';
import { InfoTemplate, SystemInfoTemplateVars } from './system-info.models';

declare const window: EavWindow;

@Component({
  selector: 'app-system-info',
  templateUrl: './system-info.component.html',
  styleUrls: ['./system-info.component.scss'],
})
export class SystemInfoComponent extends BaseComponent implements OnInit, OnDestroy {
  @Input() dialogSettings: DialogSettings;

  pageLogDuration: number;
  positiveWholeNumber = /^[1-9][0-9]*$/;
  templateVars$: Observable<SystemInfoTemplateVars>;

  private systemInfoSet$: BehaviorSubject<SystemInfoSet | undefined>;
  private languages$: BehaviorSubject<SiteLanguage[] | undefined>;
  private loading$: BehaviorSubject<boolean>;

  constructor(
    router: Router,
    route: ActivatedRoute,
    private zoneService: ZoneService,
    private snackBar: MatSnackBar,
    private dialogService: DialogService,
    private sxcInsightsService: SxcInsightsService,
  ) {
    super(router, route)
  }

  ngOnInit(): void {
    this.systemInfoSet$ = new BehaviorSubject<SystemInfoSet | undefined>(undefined);
    this.languages$ = new BehaviorSubject<SiteLanguage[] | undefined>(undefined);
    this.loading$ = new BehaviorSubject<boolean>(false);

    this.buildTemplateVars();
    this.getSystemInfo();
    this.getLanguages();
    this.subscription.add(this.refreshOnChildClosed().subscribe(() => {
      this.buildTemplateVars();
      this.getSystemInfo();
      this.getLanguages();
    }));
  }

  ngOnDestroy(): void {
    this.systemInfoSet$.complete();
    this.languages$.complete();
    this.loading$.complete();
    super.ngOnDestroy();
  }

  copyToClipboard(text: string): void {
    copyToClipboard(text);
    this.snackBar.open('Copied to clipboard', null, { duration: 2000 });
  }

  openSiteSettings(): void {
    const sitePrimaryApp = this.dialogSettings.Context.Site.PrimaryApp;
    this.dialogService.openAppAdministration(sitePrimaryApp.ZoneId, sitePrimaryApp.AppId, 'app');
  }

  openGlobalSettings(): void {
    const globalPrimaryApp = this.dialogSettings.Context.System.PrimaryApp;
    this.dialogService.openAppAdministration(globalPrimaryApp.ZoneId, globalPrimaryApp.AppId, 'app');
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

  private buildTemplateVars(): void {
    const systemInfos$ = this.systemInfoSet$.pipe(
      map(systemInfoSet => {
        if (systemInfoSet == null) { return; }
        const info: InfoTemplate[] = [
          { label: 'CMS', value: `2sxc v.${systemInfoSet.System.EavVersion}` },
          { label: 'Platform', value: `${systemInfoSet.System.Platform} v.${systemInfoSet.System.PlatformVersion}` },
          { label: 'Zones', value: systemInfoSet.System.Zones.toString() },
          { label: 'Fingerprint', value: systemInfoSet.System.Fingerprint },
          {
            label: 'Registered to',
            value: systemInfoSet.License.Owner || '(unregistered)',
            link: systemInfoSet.License.Owner
              ? {
                url: this.router.url + "/" + GoToRegistration.getUrl(),
                label: 'manage',
                target: 'angular',
              }
              : {
                url: this.router.url + "/" + GoToRegistration.getUrl(),
                label: 'register',
                target: 'angular',
              },
          },
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
            link: {
              url: 'languages',
              label: 'manage',
              target: 'angular',
            },
          },
          {
            label: 'Apps',
            value: systemInfoSet.Site.Apps.toString(),
            link: {
              url: 'list',
              label: 'manage',
              target: 'angular',
            },
          },
        ];
        return info;
      })
    );
    const warningIcon$ = this.systemInfoSet$.pipe(
      map(systemInfoSet => {
        if (systemInfoSet == null) { return; }
        if (systemInfoSet.Messages.WarningsObsolete || systemInfoSet.Messages.WarningsOther) {
          return 'warning';
        }
        return 'check';
      }),
    );
    const warningInfos$ = this.systemInfoSet$.pipe(
      map(systemInfoSet => {
        if (systemInfoSet == null) { return; }
        const info: InfoTemplate[] = [
          {
            label: 'Warnings Obsolete',
            value: systemInfoSet.Messages.WarningsObsolete.toString(),
            link: !systemInfoSet.Messages.WarningsObsolete
              ? undefined
              : {
                url: window.$2sxc.http.apiUrl('sys/insights/logs?key=warnings-obsolete'),
                label: 'review',
                target: '_blank',
              },
          },
          {
            label: 'Warnings Other',
            value: systemInfoSet.Messages.WarningsOther.toString(),
            link: !systemInfoSet.Messages.WarningsOther
              ? undefined
              : {
                url: window.$2sxc.http.apiUrl('sys/insights/logs'),
                label: 'review',
                target: '_blank',
              },
          },
        ];
        return info;
      }),
    );
    this.templateVars$ = combineLatest([systemInfos$, siteInfos$, this.loading$, warningIcon$, warningInfos$]).pipe(
      map(([systemInfos, siteInfos, loading, warningIcon, warningInfos]) => {
        const templateVars: SystemInfoTemplateVars = {
          systemInfos,
          siteInfos,
          loading,
          warningIcon,
          warningInfos,
        };
        return templateVars;
      }),
    );
  }
}
