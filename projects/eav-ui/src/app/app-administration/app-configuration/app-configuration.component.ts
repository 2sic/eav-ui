import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewContainerRef, computed, inject, signal } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterOutlet } from '@angular/router';
import { Subject } from 'rxjs';
import { Of, transient } from '../../../../../core';
import { DocsLinkHelperComponent } from '../../admin-shared/docs-link-helper/docs-link-helper.component';
import { ContentItemsService } from '../../content-items/services/content-items.service';
import { FeatureNames } from '../../features/feature-names';
import { FeatureTextInfoComponent } from '../../features/feature-text-info/feature-text-info.component';
import { FeaturesService } from '../../features/features.service';
import { GoToPermissions } from '../../permissions/go-to-permissions';
import { SystemSettingsScopes, eavConstants } from '../../shared/constants/eav.constants';
import { TippyDirective } from '../../shared/directives/tippy.directive';
import { convertFormToUrl } from '../../shared/helpers/url-prep.helper';
import { AppScopes } from '../../shared/models/dialog-context.models';
import { DialogSettings } from '../../shared/models/dialog-settings.model';
import { EditPrep } from '../../shared/models/edit-form.model';
import { DialogRoutingService } from '../../shared/routing/dialog-routing.service';
import { Context } from '../../shared/services/context';
import { DialogService } from '../../shared/services/dialog.service';
import { AppAdminHelpers } from '../app-admin-helpers';
import { AppInternals } from '../models/app-internals.model';
import { AppInternalsService } from '../services/app-internals.service';
import { DialogConfigAppService } from '../services/dialog-config-app.service';
import { AnalyzeParts } from '../sub-dialogs/analyze-settings/analyze-settings.models';
import { AppConfigurationCardComponent } from './app-configuration-card/app-configuration-card.component';

@Component({
    selector: 'app-app-configuration',
    templateUrl: './app-configuration.component.html',
    styleUrls: ['./app-configuration.component.scss'],
    imports: [
        MatCardModule,
        MatIconModule,
        MatButtonModule,
        MatBadgeModule,
        NgTemplateOutlet,
        AppConfigurationCardComponent,
        FeatureTextInfoComponent,
        RouterOutlet,
        TippyDirective,
        DocsLinkHelperComponent,
    ]
})
export class AppConfigurationComponent implements OnInit, OnDestroy {

  #dialogSvc = transient(DialogService);
  // #contentTypesSvc = transient(ContentTypesService);

  dialogSettings: DialogSettings;

  eavConstants = eavConstants;
  AnalyzeParts = AnalyzeParts;
  SystemSettingsScopes = SystemSettingsScopes;
  AppScopes = AppScopes;
  isGlobal: boolean;
  isPrimary: boolean;
  isApp: boolean;

  // Url signals for edit routes
  appContentSystemSettingsUrl = signal('');
  appContentCustomSettingsUrl = signal('');
  appGlobalSystemSettingsUrl = signal('');
  appSiteSystemSettingsUrl = signal('');
  appGlobalSystemResourcesUrl = signal('');
  appContentSystemResourcesUrl = signal('');
  appSiteSystemResourcesUrl = signal('');
  appContentCustomResourcesUrl = signal('');
  appGlobalCustomResourcesUrl = signal('');
  appGlobalCustomSettingsUrl = signal('');
  appSiteCustomSettingsUrl = signal('');
  appSiteCustomResourcesUrl = signal('');

  // More proper ViewModel
  appSettingsInternal$ = new Subject<AppInternals>();

  public appStateAdvanced = false;
  public features = inject(FeaturesService);

  protected lightSpeedEnabled = this.features.isEnabled[FeatureNames.LightSpeed];
  protected cspEnabled = this.features.isEnabled[FeatureNames.ContentSecurityPolicy];
  protected langPermsEnabled = this.features.isEnabled[FeatureNames.PermissionsByLanguage];

  #appInternalsService = transient(AppInternalsService);
  #contentItemsService = transient(ContentItemsService);
  #dialogConfigSvc = transient(DialogConfigAppService);
  #dialogRouter = transient(DialogRoutingService);

  #refresh = signal(0);

  appIn = computed(() => {
    const refresh = this.#refresh();
    return this.#appInternalsService.getAppInternals(undefined)
  });

  viewModelSig = computed(() => {
    const appInternalsSig = this.appIn()();
    if (!appInternalsSig)
      return null;

    const props = appInternalsSig?.EntityLists;
    const lsTypeName = eavConstants.appMetadata.LightSpeed.ContentTypeName;

    const result: AppConfigurationViewModel = {
      appLightSpeedCount: appInternalsSig.MetadataList.Items.filter(i => i._Type.Name === lsTypeName).length,
      systemSettingsCount: this.isPrimary
        ? props.SettingsSystem.filter(i => i.SettingsEntityScope === SystemSettingsScopes.Site).length
        : props.SettingsSystem.filter(i => !i.SettingsEntityScope).length,
      customSettingsCount: props.AppSettings?.length,
      customSettingsFieldsCount: appInternalsSig.FieldAll.AppSettings?.length,
      systemResourcesCount: this.isPrimary
        ? props.ResourcesSystem.filter(i => i.SettingsEntityScope === SystemSettingsScopes.Site).length
        : props.ResourcesSystem.filter(i => !i.SettingsEntityScope).length,
      customResourcesCount: props.AppResources?.length,
      customResourcesFieldsCount: appInternalsSig?.FieldAll.AppResources?.length,
    };

    return result;
  });

  constructor(
    private context: Context,
    private snackBar: MatSnackBar,
    private matDialog: MatDialog,
    private viewContainerRef: ViewContainerRef,
    private changeDetectorRef: ChangeDetectorRef,
  ) {
    this.appGlobalSystemSettingsUrl = this.urlToEditSystem(eavConstants.contentTypes.systemSettings, SystemSettingsScopes.App);
    this.appContentSystemSettingsUrl = this.urlToEditSystem(eavConstants.contentTypes.systemSettings, SystemSettingsScopes.App);
    this.appSiteSystemSettingsUrl = this.urlToEditSystem(eavConstants.contentTypes.systemSettings, SystemSettingsScopes.Site);
    this.appGlobalSystemResourcesUrl = this.urlToEditSystem(eavConstants.contentTypes.systemResources, SystemSettingsScopes.App);
    this.appContentSystemResourcesUrl = this.urlToEditSystem(eavConstants.contentTypes.systemResources, SystemSettingsScopes.App);
    this.appSiteSystemResourcesUrl = this.urlToEditSystem(eavConstants.contentTypes.systemResources, SystemSettingsScopes.Site);
    this.appContentCustomSettingsUrl = this.urlToEditDefault(eavConstants.contentTypes.settings);
    this.appContentCustomResourcesUrl = this.urlToEditDefault(eavConstants.contentTypes.resources);
    this.appGlobalCustomResourcesUrl = this.urlToEditCustom(eavConstants.contentTypes.customResources);
    this.appSiteCustomResourcesUrl = this.urlToEditCustom(eavConstants.contentTypes.customResources);
    this.appGlobalCustomSettingsUrl = this.urlToEditCustom(eavConstants.contentTypes.customSettings);
    this.appSiteCustomSettingsUrl = this.urlToEditCustom(eavConstants.contentTypes.customSettings);
  }

  ngOnInit() {
    this.#dialogRouter.doOnDialogClosed(() => {
      this.#refresh.update(value => value + 1);
    });

    this.#dialogConfigSvc.getCurrent$().subscribe((dialogSettings) => {
      this.dialogSettings = dialogSettings;
      const appScope = dialogSettings.Context.App.SettingsScope;
      this.isGlobal = appScope === AppScopes.Global;
      this.isPrimary = appScope === AppScopes.Site;
      this.isApp = appScope === AppScopes.App;
    });
  }

  ngOnDestroy() {
    this.snackBar.dismiss();
  }

  #urlTo(url: string, queryParams?: { [key: string]: string }, errComponent?: string) {
    let newUrl = '#' + this.#dialogRouter.urlSubRoute(url);
    if (queryParams) {
      newUrl += `?${new URLSearchParams(queryParams).toString()}`;
    }
    if (errComponent) {
      newUrl += `&errComponent=${errComponent}`;
    }
    return newUrl;
  }

  // case eavConstants.contentTypes.systemSettings:
  // case eavConstants.contentTypes.systemResources:
  urlToEditSystem(staticName: string, systemSettingsScope?: Of<typeof SystemSettingsScopes>) {
    const url = signal('');
    this.#contentItemsService.getAll(staticName).subscribe(contentItems => {
      const systemSettingsEntities = contentItems.filter(i =>
        systemSettingsScope === SystemSettingsScopes.App
          ? !i.SettingsEntityScope
          : i.SettingsEntityScope === SystemSettingsScopes.Site
      );
      if (systemSettingsEntities.length > 1) {
        url.set(this.#urlTo('message/e', { error: 'AppAdmin.ErrorTooManyAppSettings' }, staticName));
      } else {
        const systemSettingsEntity = systemSettingsEntities[0];
        url.set(this.#urlTo(
          `edit/${convertFormToUrl({
            items: [
              systemSettingsEntity == null
                ? EditPrep.newFromType(staticName, {
                  ...(systemSettingsScope === SystemSettingsScopes.Site && {
                    SettingsEntityScope: SystemSettingsScopes.Site,
                  }),
                })
                : EditPrep.editId(systemSettingsEntity.Id),
            ],
          })}`
        ));
      }
    });

    return url;
  }

  // case eavConstants.contentTypes.customSettings:
  // case eavConstants.contentTypes.customResources:
  urlToEditCustom(staticName: string) {
    const url = signal('');
    this.#contentItemsService.getAll(staticName).subscribe(contentItems => {
      if (contentItems.length > 1) {
        url.set(this.#urlTo('message/e', { error: 'AppAdmin.ErrorTooManyAppSettings' }, staticName));
      } else {
        const customSettingsEntity = contentItems[0];
        url.set(this.#urlTo(
          `edit/${convertFormToUrl({
            items: [
              customSettingsEntity == null
                ? EditPrep.newFromType(staticName)
                : EditPrep.editId(customSettingsEntity.Id),
            ],
          })}`
        ));
      }
    });

    return url;
  }

  // case default:
  urlToEditDefault(staticName: string) {
    const url = signal('');
    this.#contentItemsService.getAll(staticName).subscribe(contentItems => {
      if (contentItems.length < 1) {
        url.set(this.#urlTo('message/e', { error: 'AppAdmin.ErrorNoManyAppSettings' }, staticName));
      } else if (contentItems.length > 1) {
        url.set(this.#urlTo('message/e', { error: 'AppAdmin.ErrorTooManyAppSettings' }, staticName));
      } else {
        url.set(this.#urlTo(
          `edit/${convertFormToUrl({
            items: [EditPrep.editId(contentItems[0].Id)],
          })}`
        ));
      }
    });

    return url;
  }

  urlToGetLightSpeedLink(): string {
    return this.#urlTo(
      `edit/${convertFormToUrl(
        AppAdminHelpers.getLightSpeedEditParams(this.context.appId)
      )}`
    );
  }

  openSiteSettings() {
    const sitePrimaryApp = this.dialogSettings.Context.Site.PrimaryApp;
    this.#dialogSvc.openAppAdministration(sitePrimaryApp.ZoneId, sitePrimaryApp.AppId, 'app');
  }

  openGlobalSettings() {
    const globalPrimaryApp = this.dialogSettings.Context.System.PrimaryApp;
    this.#dialogSvc.openAppAdministration(globalPrimaryApp.ZoneId, globalPrimaryApp.AppId, 'app');
  }

  urlToConfig(staticName: string) {
    return this.#urlTo(`fields/${staticName}`);
  }

  urlToOpenPermissions() {
    return this.#urlTo(GoToPermissions.getUrlApp(this.context.appId));
  }

  urlToOpenLanguagePermissions(enabled: boolean) {
    if (enabled)
      return this.#urlTo('language-permissions')
    else
      return this.#urlTo('edit-language-permissions')
  }

  urlToAnalyze(part: Of<typeof AnalyzeParts>) {
    return this.#urlTo(`analyze/${part}`);
  }
}

class AppConfigurationViewModel {
  // Lightspeed
  appLightSpeedCount: number;

  systemSettingsCount: number;
  customSettingsCount: number;
  customSettingsFieldsCount: number;
  systemResourcesCount: number;
  customResourcesCount: number;
  customResourcesFieldsCount: number;
}
