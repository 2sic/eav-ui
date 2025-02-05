import { NgTemplateOutlet } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
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
import { ContentTypeEdit } from '../models/content-type.model';
import { AppInternalsService } from '../services/app-internals.service';
import { ContentTypesService } from '../services/content-types.service';
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
export class AppConfigurationComponent implements OnInit {

  #featuresSvc = inject(FeaturesService);

  #dialogSvc = transient(DialogService);
  #contentTypesSvc = transient(ContentTypesService);
  #appInternalsService = transient(AppInternalsService);
  #contentItemsService = transient(ContentItemsService);
  #dialogConfigSvc = transient(DialogConfigAppService);
  #dialogRouter = transient(DialogRoutingService);

  constructor(
    private context: Context,
  ) { }


  dialogSettings: DialogSettings;

  eavConstants = eavConstants;
  AnalyzeParts = AnalyzeParts;
  SystemSettingsScopes = SystemSettingsScopes;
  AppScopes = AppScopes;
  isGlobal = signal(false);
  isSite = signal(false);
  isApp = signal(false);

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

  // TODO: @2pp this was a mistake - change in logic.
  //       need to discuss, as it's not clear why you introduced this
  // customGlobalSettingsAvailable = signal(false);
  // customGlobalResourcesAvailable = signal(false);
  // customSiteSettingsAvailable = signal(false);
  // customSiteResourcesAvailable = signal(false);


  // More proper ViewModel
  appSettingsInternal$ = new Subject<AppInternals>();

  public appStateAdvanced = false;

  protected lightSpeedEnabled = this.#featuresSvc.isEnabled[FeatureNames.LightSpeed];
  protected cspEnabled = this.#featuresSvc.isEnabled[FeatureNames.ContentSecurityPolicy];
  protected langPermsEnabled = this.#featuresSvc.isEnabled[FeatureNames.PermissionsByLanguage];


  #refresh = signal(0);

  #appSpecsLazy = computed(() => {
    const _ = this.#refresh();
    return this.#appInternalsService.getAppInternals(/* initial: */ null)
  });

  /** Statistics for the content-types and fields for later */
  #dataStatistics = computed(() => {
    const appSpecs = this.#appSpecsLazy()();
    if (!appSpecs)
      return null;

    const props = appSpecs?.EntityLists;
    const lsTypeName = eavConstants.appMetadata.LightSpeed.ContentTypeName;

    const isSite = this.isSite();
    const result: TempDataStatistics = {
      appLightSpeedCount: appSpecs.MetadataList.Items.filter(i => i._Type.Name === lsTypeName).length,
      systemSettingsCount: isSite
        ? props.SettingsSystem.filter(i => i.SettingsEntityScope === SystemSettingsScopes.Site).length
        : props.SettingsSystem.filter(i => !i.SettingsEntityScope).length,
      customSettingsCount: props.AppSettings?.length,
      customSettingsFieldsCount: appSpecs.FieldAll.AppSettings?.length,
      systemResourcesCount: isSite
        ? props.ResourcesSystem.filter(i => i.SettingsEntityScope === SystemSettingsScopes.Site).length
        : props.ResourcesSystem.filter(i => !i.SettingsEntityScope).length,
      customResourcesCount: props.AppResources?.length,
      customResourcesFieldsCount: appSpecs?.FieldAll.AppResources?.length,
    };

    return result;
  });

  /** Test if current types for settings/resources exist, otherwise they must be created before opening dialogs */
  #customTypesExist = computed(() => {
    const appSpecs = this.#appSpecsLazy()();
    return (!appSpecs)
      ? { settings: false, resources: false }
      : {
          settings: appSpecs.FieldAll.AppSettings != null,
          resources: appSpecs.FieldAll.AppResources != null,
        }
  });



  ngOnInit() {
    this.#dialogRouter.doOnDialogClosed(() => this.#refresh.update(v => v++));

    this.#dialogConfigSvc.getCurrent$().subscribe((dialogSettings) => {
      this.dialogSettings = dialogSettings;
      const appScope = dialogSettings.Context.App.SettingsScope;
      this.isGlobal.set(appScope === AppScopes.Global);
      this.isSite.set(appScope === AppScopes.Site);
      this.isApp.set(appScope === AppScopes.App);

      this.#ready.set(true);
    });
  }

  ngAfterViewInit() {
    // Load the data after the UI is rendered
    this.loadData();
  }

  #ready = signal(false);
  buttons = computed<Buttons>(() => {
    // if not ready, return a full object with empty values
    const ready = this.#ready();
    if (!ready) {
      const nothing : ButtonSpecs = { tooltip: '', url: '', count: null };
      return {
        topRowLabel: 'loading...',
        customSettingsType: '',
        customResourcesType: '',
        systemSettings: nothing,
        customSettings: nothing,
        customSettingsFields: nothing,
        systemResources: nothing,
        customResources: nothing,
        customResourcesFields: nothing,
        lightspeed: nothing,
      }
    }

    // read signals
    const isGlobal = this.isGlobal();
    const isSite = this.isSite();
    const isApp = this.isApp();

    // The name of the top row, to use in the row label and tooltips
    const scopeName = isGlobal ? 'Global' : isSite ? 'Site' : 'App';

    // The statistics of the entities - should later be simplified once code is improved @2pp
    const viewModel = this.#dataStatistics();

    const typeNames = eavConstants.contentTypes;
    const customSettingsType = isApp ? typeNames.settings : typeNames.customSettings;
    const customResourcesType = isApp ? typeNames.resources : typeNames.customResources;
    // Detect if the custom types exist
    const typesExist = this.#customTypesExist();
    return {
      topRowLabel: scopeName,
      customSettingsType: customSettingsType,
      customResourcesType: customResourcesType,
      systemSettings: {
        tooltip: `Edit ${scopeName} system settings`,
        // TODO: @2pp fix this, it's just patch
        // correctly we should not even retrieve the other urls we don't need, so this can be improved a lot
        url: isGlobal ? this.appGlobalSystemSettingsUrl() : isSite ? this.appSiteSystemSettingsUrl() : this.appContentSystemSettingsUrl(),
        count: viewModel?.systemSettingsCount || null,
      },
      customSettings: {
        tooltip: `Edit ${scopeName} custom settings`,
        // TODO: @2pp fix this, it's just patch, urls...
        url: typesExist.settings
          ? isGlobal ? this.appGlobalCustomSettingsUrl() : isSite ? this.appSiteCustomSettingsUrl() : this.appContentCustomSettingsUrl()
          : null,
        count: viewModel?.customSettingsCount || null,
      },
      customSettingsFields: {
        tooltip: `Configure fields of the custom ${scopeName} settings`,
        url: typesExist.settings
          ? this.urlToConfig(customSettingsType)
          : null,
        count: viewModel?.customSettingsFieldsCount || null,
      },
      systemResources: {
        tooltip: `Edit ${scopeName} system resources`,
        url: isGlobal ? this.appGlobalSystemResourcesUrl() : isSite ? this.appSiteSystemResourcesUrl() : this.appContentSystemResourcesUrl(),
        count: viewModel?.systemResourcesCount || null,
      },
      customResources: {
        tooltip: `Edit ${scopeName} custom resources`,
        url: typesExist.resources
          ? isGlobal ? this.appGlobalCustomResourcesUrl() : isSite ? this.appSiteCustomResourcesUrl() : this.appContentCustomResourcesUrl()
          : null,
        count: viewModel?.customResourcesCount || null,
      },
      customResourcesFields: {
        tooltip: `Edit ${scopeName} custom resources fields`,
        url: this.urlToConfig(customResourcesType),
        count: viewModel?.customResourcesFieldsCount || null,
      },
      lightspeed: {
        tooltip: `Edit ${scopeName} LightSpeed`,
        url: this.urlToGetLightSpeedLink(),
        count: viewModel?.appLightSpeedCount || null,
      },
    } satisfies Buttons;
  });


  loadData() {
    // TODO: @2pp THIS IS COMPLETELY WRONG
    // You are requesting the same data over and over again, just to generate a single url.
    // Correct solution is to
    // 1. get all the data you need in a single request and put it in a signal
    // 2. make the urls computed signals based on that signal
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

    // Disable the Links when the setting contenttypes are not defined
    // TODO: @2pp - your solution was not good, it resulted in sending 4 server requests instead of 2
    // TODO: @2pp this is also wrong - the signal will return and always have length 0! so something is pretty wrong here
    // See also comments above... should be a signal + computed
    // const customSettings = this.#contentItemsService.getAllSig(eavConstants.contentTypes.customSettings,  /* initial: */ null);
    // const customResources = this.#contentItemsService.getAllSig(eavConstants.contentTypes.customResources,  /* initial: */ null);
    // this.customGlobalSettingsAvailable.set(customSettings.length === 1);
    // this.customGlobalResourcesAvailable.set(customResources.length === 1);
    // this.customSiteSettingsAvailable.set(customSettings.length === 1);
    // this.customSiteResourcesAvailable.set(customResources.length === 1);
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
        url.set(this.#urlTo('message/e', { error: 'AppAdmin.ErrorNoAppSettings' }, staticName));
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
    const siteApp = this.dialogSettings.Context.Site.PrimaryApp;
    this.#dialogSvc.openAppAdministration(siteApp.ZoneId, siteApp.AppId, 'app');
  }

  openGlobalSettings() {
    const globalApp = this.dialogSettings.Context.System.PrimaryApp;
    this.#dialogSvc.openAppAdministration(globalApp.ZoneId, globalApp.AppId, 'app');
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

  fixContentTypeIfNecessary(url: string, typeName: string, event: MouseEvent) {
    // If we have a url, everything is fine so we can just return and let the click happen
    if (url) return;

    event.preventDefault();
    event.stopPropagation();
    
    // Create the Content-Type
    const newContentType = {
      StaticName: '',
      // NameId: '',
      Name: typeName,
      Description: '',
      Scope: eavConstants.scopes.configuration.value,
      // ChangeStaticName: false,
      ChangeNameId: false,
      // NewStaticName: '',
      NewNameId: '',
    } as ContentTypeEdit;

    this.#contentTypesSvc.save(newContentType).subscribe(success => {
      if (!success) return;
      // trigger refresh
      this.#refresh.update(v => v + 1);

      // Inform user
      alert('I just had to create the Content Type. Please try again 👍🏼.');
    });
    return false;
  }

  // 2025-01-21 2dm had to restore this functionality, keep this code till 2025-Q2 just in case
  // fixContentType(staticName: string, action: 'edit' | 'config') {
  //   this.#contentTypesSvc.retrieveContentTypes(eavConstants.scopes.configuration.value).subscribe(contentTypes => {
  //     const contentTypeExists = contentTypes.some(ct => ct.Name === staticName);
  //     if (contentTypeExists) {
  //       if (action === 'edit') {
  //         this.edit(staticName);
  //       } else if (action === 'config') {
  //         this.config(staticName);
  //       }
  //     } else {
  //       const newContentType = {
  //         StaticName: '',
  //         // NameId: '',
  //         Name: staticName,
  //         Description: '',
  //         Scope: eavConstants.scopes.configuration.value,
  //         // ChangeStaticName: false,
  //         ChangeNameId: false,
  //         // NewStaticName: '',
  //         NewNameId: '',
  //       } as ContentTypeEdit;
  //       this.#contentTypesSvc.save(newContentType).subscribe(success => {
  //         if (!success) return;

  //         if (action === 'edit') {
  //           this.edit(staticName);
  //         } else if (action === 'config') {
  //           this.config(staticName);
  //         }
  //       });
  //     }
  //   });
  // }
}

class TempDataStatistics {
  // Lightspeed
  appLightSpeedCount: number;

  systemSettingsCount: number;
  customSettingsCount: number;
  customSettingsFieldsCount: number;
  systemResourcesCount: number;
  customResourcesCount: number;
  customResourcesFieldsCount: number;
}



interface ButtonSpecs {
  /** Tooltip on the button */
  tooltip: string,
  /** url to open a dialog, or null if the content-type doesn't exist and requires pre-work */
  url: string,
  /** count of fields or entities */
  count: number,
}
interface Buttons {
  topRowLabel: string,
  customSettingsType: string,
  customResourcesType: string,
  systemSettings: ButtonSpecs,
  customSettings: ButtonSpecs,
  customSettingsFields: ButtonSpecs,
  systemResources: ButtonSpecs,
  customResources: ButtonSpecs,
  customResourcesFields: ButtonSpecs,
  lightspeed: ButtonSpecs,
}