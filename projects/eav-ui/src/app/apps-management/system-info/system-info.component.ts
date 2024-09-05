import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterLink, RouterOutlet } from '@angular/router';
import { BehaviorSubject, combineLatest, map, Observable, take } from 'rxjs';
import { FeatureNames } from '../../features/feature-names';
import { copyToClipboard } from '../../shared/helpers/copy-to-clipboard.helper';
import { EavWindow } from '../../shared/models/eav-window.model';
import { DialogService } from '../../shared/services/dialog.service';
import { FeaturesService } from '../../features/features.service';
import { SiteLanguage } from '../models/site-language.model';
import { SystemInfoSet } from '../models/system-info.model';
import { SxcInsightsService } from '../services/sxc-insights.service';
import { ZoneService } from '../services/zone.service';
import { InfoTemplate, SystemInfoViewModel } from './system-info.models';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { NgTemplateOutlet, AsyncPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { FeatureTextInfoComponent } from '../../features/feature-text-info/feature-text-info.component';
import { FieldHintComponent } from '../../shared/components/field-hint/field-hint.component';
import { TippyDirective } from '../../shared/directives/tippy.directive';
import { transient } from '../../core';
import { AppDialogConfigService } from '../../app-administration/services/app-dialog-config.service';
import { DialogRoutingService } from '../../shared/routing/dialog-routing.service';

declare const window: EavWindow;

@Component({
  selector: 'app-system-info',
  templateUrl: './system-info.component.html',
  styleUrls: ['./system-info.component.scss'],
  standalone: true,
  imports: [
    MatCardModule,
    MatIconModule,
    RouterLink,
    NgTemplateOutlet,
    MatButtonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    RouterOutlet,
    AsyncPipe,
    FeatureTextInfoComponent,
    FieldHintComponent,
    TippyDirective,
  ],
})
export class SystemInfoComponent implements OnInit, OnDestroy {

  public features: FeaturesService = inject(FeaturesService);

  #dialogSettings = transient(AppDialogConfigService);
  #sxcInsightsService = transient(SxcInsightsService);
  #zoneSvc = transient(ZoneService);
  #dialogSvc = transient(DialogService);
  #dialogRouter = transient(DialogRoutingService);

  pageLogDuration: number;
  positiveWholeNumber = /^[1-9][0-9]*$/;
  viewModel$: Observable<SystemInfoViewModel>;

  #systemInfoSet$: BehaviorSubject<SystemInfoSet | undefined>;
  #languages$: BehaviorSubject<SiteLanguage[] | undefined>;
  #loading$: BehaviorSubject<boolean>;

  protected lsEnabled = this.features.isEnabled(FeatureNames.LightSpeed);
  protected cspEnabled = this.features.isEnabled(FeatureNames.ContentSecurityPolicy);

  constructor(
    private snackBar: MatSnackBar,
  ) {
  }

  ngOnInit(): void {
    this.#systemInfoSet$ = new BehaviorSubject<SystemInfoSet | undefined>(undefined);
    this.#languages$ = new BehaviorSubject<SiteLanguage[] | undefined>(undefined);
    this.#loading$ = new BehaviorSubject<boolean>(false);
    this.buildViewModel();
    this.getSystemInfo();
    this.getLanguages();
    this.#dialogRouter.doOnDialogClosed(() => {
      this.buildViewModel();
      this.getSystemInfo();
      this.getLanguages();
    });
  }

  ngOnDestroy(): void {
    this.#systemInfoSet$.complete();
    this.#languages$.complete();
    this.#loading$.complete();
  }

  copyToClipboard(text: string): void {
    copyToClipboard(text);
    this.snackBar.open('Copied to clipboard', null, { duration: 2000 });
  }

  openSiteSettings(): void {
    this.openParentAppSettings("Site");
  }

  openGlobalSettings(): void {
    this.openParentAppSettings("System");
  }

  openParentAppSettings(partName: "System" | "Site"): void {
    this.#dialogSettings.getCurrent$()
      .pipe(map(dc => dc?.Context[partName].PrimaryApp), take(1))
      .subscribe(appIdentity => {
        this.#dialogSvc.openAppAdministration(appIdentity.ZoneId, appIdentity.AppId, 'app');
      })
  }

  openInsights() {
    window.open(window.$2sxc.http.apiUrl('sys/insights/help'), '_blank');
  }


  openSideNavPath(sideNavPath: string): void {

    // Url are /2/apps/system/registration, sideNavPath are only the last part of the url
    if (sideNavPath.includes('registration'))
      sideNavPath = 'registration';

    const router = this.#dialogRouter.router;
    router.navigate([router.url.replace('system', '') + sideNavPath]);
  }

  activatePageLog(form: NgForm) {
    this.#loading$.next(true);
    this.snackBar.open('Activating...');
    this.#sxcInsightsService.activatePageLog(this.pageLogDuration).subscribe(res => {
      this.#loading$.next(false);
      this.snackBar.open(res, null, { duration: 4000 });
    });
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    form.resetForm();
  }

  private getSystemInfo(): void {
    this.#zoneSvc.getSystemInfo().subscribe({
      error: () => {
        this.#systemInfoSet$.next(undefined);
      },
      next: (systemInfoSet) => {
        this.#systemInfoSet$.next(systemInfoSet);
      },
    });
  }

  private getLanguages(): void {
    this.#zoneSvc.getLanguages().subscribe({
      error: () => {
        this.#languages$.next(undefined);
      },
      next: (languages) => {
        this.#languages$.next(languages);
      },
    });
  }

  private buildViewModel(): void {
    const systemInfos$ = this.#systemInfoSet$.pipe(
      map(systemInfoSet => {
        if (systemInfoSet == null) return;
        const url = this.#dialogRouter.router.url + '/' + "registration";
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
                url,
                label: 'manage',
                target: 'angular',
              }
              : {
                url,
                label: 'register',
                target: 'angular',
              },
          },
        ];
        return info;
      })
    );
    const siteInfos$ = combineLatest([this.#systemInfoSet$, this.#languages$]).pipe(
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
    const warningIcon$ = this.#systemInfoSet$.pipe(
      map(systemInfoSet => {
        if (systemInfoSet == null) { return; }
        if (systemInfoSet.Messages.WarningsObsolete || systemInfoSet.Messages.WarningsOther) {
          return 'warning';
        }
        return 'check';
      }),
    );
    const warningInfos$ = this.#systemInfoSet$.pipe(
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
    this.viewModel$ = combineLatest([systemInfos$, siteInfos$, this.#loading$, warningIcon$, warningInfos$]).pipe(
      map(([systemInfos, siteInfos, loading, warningIcon, warningInfos]) => {
        const viewModel: SystemInfoViewModel = {
          systemInfos,
          siteInfos,
          loading,
          warningIcon,
          warningInfos,
        };
        return viewModel;
      }),
    );
  }
}
