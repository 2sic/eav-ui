import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterLink, RouterOutlet } from '@angular/router';
import { map, take } from 'rxjs';
import { transient } from '../../../../../core';
import { DocsLinkHelperComponent } from '../../admin-shared/docs-link-helper/docs-link-helper.component';
import { DialogConfigAppService } from '../../app-administration/services/dialog-config-app.service';
import { FeatureNames } from '../../features/feature-names';
import { FeatureTextInfoComponent } from '../../features/feature-text-info/feature-text-info.component';
import { FeaturesService } from '../../features/features.service';
import { FieldHintComponent } from '../../shared/components/field-hint/field-hint.component';
import { TippyDirective } from '../../shared/directives/tippy.directive';
import { EavWindow } from '../../shared/models/eav-window.model';
import { DialogInNewWindowService } from '../../shared/routing/dialog-in-new-window.service';
import { DialogRoutingService } from '../../shared/routing/dialog-routing.service';
import { ClipboardService } from '../../shared/services/clipboard.service';
import { SxcInsightsService } from '../services/sxc-insights.service';
import { ZoneService } from '../services/zone.service';
import { InfoTemplate } from './system-info.models';

declare const window: EavWindow;

@Component({
  selector: 'app-system-info',
  templateUrl: './system-info.component.html',
  imports: [
    MatCardModule,
    MatIconModule,
    RouterLink,
    MatButtonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    RouterOutlet,
    FeatureTextInfoComponent,
    FieldHintComponent,
    TippyDirective,
    DocsLinkHelperComponent,
  ]
})
export class SystemInfoComponent implements OnInit {

  public features = inject(FeaturesService);

  #dialogSettings = transient(DialogConfigAppService);
  #sxcInsightsService = transient(SxcInsightsService);
  #zoneSvc = transient(ZoneService);
  #dialogInNewWindowSvc = transient(DialogInNewWindowService);
  #dialogRouter = transient(DialogRoutingService);

  pageLogDuration: number;
  positiveWholeNumber = /^[1-9][0-9]*$/;

  loading = signal(false);
  #refresh = signal(0);

  // languages = computed(() => {
  //   const r = this.#refresh();
  //   return this.#zoneSvc.getLanguage(undefined);
  // })

  #languages = this.#zoneSvc.getLanguageLive(this.#refresh).value;
  #systemInfoSet = this.#zoneSvc.getSystemInfoLive(this.#refresh).value;

  systemInfos = computed(() => {
    const systemInfoSetValue = this.#systemInfoSet();
    if (systemInfoSetValue == null) return;
    const url = this.#dialogRouter.router.url + '/' + "registration";
    const info: InfoTemplate[] = [
      { label: 'CMS', value: `2sxc v.${systemInfoSetValue.System.EavVersion}` },
      { label: 'Platform', value: `${systemInfoSetValue.System.Platform} v.${systemInfoSetValue.System.PlatformVersion}` },
      { label: 'Zones', value: systemInfoSetValue.System.Zones.toString() },
      { label: 'Fingerprint', value: systemInfoSetValue.System.Fingerprint },
      {
        label: 'Registered to',
        value: systemInfoSetValue.License.Owner || '(unregistered)',
        link: systemInfoSetValue.License.Owner
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
  });

  siteInfos = computed(() => {
    const systemInfoSetValue = this.#systemInfoSet();
    const languagesValue = this.#languages();

    if (systemInfoSetValue == null || languagesValue == null) return;

    const allLanguages = languagesValue.length;
    const activeLanguages = languagesValue.filter(l => l.IsEnabled).length;

    const info: InfoTemplate[] = [
      { label: 'Zone', value: systemInfoSetValue.Site.ZoneId.toString() },
      { label: 'Site', value: systemInfoSetValue.Site.SiteId.toString() },
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
        value: systemInfoSetValue.Site.Apps.toString(),
        link: {
          url: 'list',
          label: 'manage',
          target: 'angular',
        },
      },
    ];

    return info;
  });

  warningIcon = computed(() => {
    const systemInfoSetValue = this.#systemInfoSet();
    if (systemInfoSetValue == null) return undefined;
    if (systemInfoSetValue.Messages.WarningsObsolete || systemInfoSetValue.Messages.WarningsOther) {
      return 'warning';
    }
    return 'check';
  });

  warningInfos = computed(() => {
    const systemInfoSetValue = this.#systemInfoSet();
    if (systemInfoSetValue == null) return undefined;

    const info: InfoTemplate[] = [
      {
        label: 'Warnings Obsolete',
        value: systemInfoSetValue.Messages.WarningsObsolete.toString(),
        link: !systemInfoSetValue.Messages.WarningsObsolete
          ? undefined
          : {
            url: window.$2sxc.http.apiUrl('sys/insights/logs?key=warnings-obsolete'),
            label: 'review',
            target: '_blank',
          },
      },
      {
        label: 'Warnings Other',
        value: systemInfoSetValue.Messages.WarningsOther.toString(),
        link: !systemInfoSetValue.Messages.WarningsOther
          ? undefined
          : {
            url: window.$2sxc.http.apiUrl('sys/insights/logs'),
            label: 'review',
            target: '_blank',
          },
      },
    ];
    return info;
  });

  protected lsEnabled = this.features.isEnabled[FeatureNames.LightSpeed];
  protected cspEnabled = this.features.isEnabled[FeatureNames.ContentSecurityPolicy];

  constructor(
    private snackBar: MatSnackBar,
  ) { }

  protected clipboard = transient(ClipboardService);

  ngOnInit(): void {
    this.#dialogRouter.doOnDialogClosed(() => {
      this.#refresh.update(v => ++v)
    });
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
        this.#dialogInNewWindowSvc.openAppAdministration(appIdentity.ZoneId, appIdentity.AppId, 'app');
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

  // TODO: 2dg new with Signals
  activatePageLog(form: NgForm) {
    this.loading.set(true);
    this.snackBar.open('Activating...');
    this.#sxcInsightsService.activatePageLog(this.pageLogDuration).subscribe(res => {
      this.loading.set(false);
      this.snackBar.open(res, null, { duration: 4000 });
    });
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    form.resetForm();
  }

}
