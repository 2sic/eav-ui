import { AsyncPipe, NgTemplateOutlet } from '@angular/common';
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
import { FeaturesScopedService } from '../../features/features-scoped.service';
import { GoToPermissions } from '../../permissions/go-to-permissions';
import { SystemSettingsScopes, eavConstants } from '../../shared/constants/eav.constants';
import { TippyDirective } from '../../shared/directives/tippy.directive';
import { convertFormToUrl } from '../../shared/helpers/url-prep.helper';
import { AppScopes } from '../../shared/models/dialog-context.models';
import { DialogSettings } from '../../shared/models/dialog-settings.model';
import { EditForm, EditPrep } from '../../shared/models/edit-form.model';
import { DialogRoutingService } from '../../shared/routing/dialog-routing.service';
import { Context } from '../../shared/services/context';
import { DialogService } from '../../shared/services/dialog.service';
import { AppAdminHelpers } from '../app-admin-helpers';
import { ContentTypeEdit } from '../models';
import { AppInternals } from '../models/app-internals.model';
import { ContentTypesService } from '../services';
import { AppInternalsService } from '../services/app-internals.service';
import { DialogConfigAppService } from '../services/dialog-config-app.service';
import { AnalyzeParts } from '../sub-dialogs/analyze-settings/analyze-settings.models';
import { AppConfigurationCardComponent } from './app-configuration-card/app-configuration-card.component';

@Component({
  selector: 'app-app-configuration',
  templateUrl: './app-configuration.component.html',
  styleUrls: ['./app-configuration.component.scss'],
  standalone: true,
  imports: [
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatBadgeModule,
    NgTemplateOutlet,
    AppConfigurationCardComponent,
    FeatureTextInfoComponent,
    RouterOutlet,
    AsyncPipe,
    TippyDirective,
    DocsLinkHelperComponent,
  ],
})
export class AppConfigurationComponent implements OnInit, OnDestroy {

  #dialogSvc = transient(DialogService);
  #contentTypesSvc = transient(ContentTypesService);

  dialogSettings: DialogSettings;

  eavConstants = eavConstants;
  AnalyzeParts = AnalyzeParts;
  SystemSettingsScopes = SystemSettingsScopes;
  AppScopes = AppScopes;
  isGlobal: boolean;
  isPrimary: boolean;
  isApp: boolean;

  // More proper ViewModel
  appSettingsInternal$ = new Subject<AppInternals>();

  public appStateAdvanced = false;
  public features = inject(FeaturesScopedService);

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
  ) { }

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

  #urlTo(url: string) {
    return '#' + this.#dialogRouter.urlSubRoute(url);
  }

  edit(staticName: string, systemSettingsScope?: Of<typeof SystemSettingsScopes>) {
    this.#contentItemsService.getAll(staticName).subscribe(contentItems => {
      let form: EditForm;
      let errorMsg: string;

      switch (staticName) {
        case eavConstants.contentTypes.systemSettings:
        case eavConstants.contentTypes.systemResources:
          const systemSettingsEntities = contentItems.filter(i =>
            systemSettingsScope === SystemSettingsScopes.App
              ? !i.SettingsEntityScope
              : i.SettingsEntityScope === SystemSettingsScopes.Site
          );
          if (systemSettingsEntities.length > 1) {
            errorMsg = `Found too many settings for type ${staticName}`;
          } else {
            const systemSettingsEntity = systemSettingsEntities[0];
            form = {
              items: [
                systemSettingsEntity == null
                  ? EditPrep.newFromType(staticName, {
                    ...(systemSettingsScope === SystemSettingsScopes.Site && {
                      SettingsEntityScope: SystemSettingsScopes.Site,
                    }),
                  })
                  : EditPrep.editId(systemSettingsEntity.Id),
              ],
            };
          }
          break;

        case eavConstants.contentTypes.customSettings:
        case eavConstants.contentTypes.customResources:
          if (contentItems.length > 1) {
            errorMsg = `Found too many settings for type ${staticName}`;
          } else {
            const customSettingsEntity = contentItems[0];
            form = {
              items: [
                customSettingsEntity == null
                  ? EditPrep.newFromType(staticName)
                  : EditPrep.editId(customSettingsEntity.Id),
              ],
            };
          }
          break;

        default:
          if (contentItems.length < 1) {
            errorMsg = `Found no settings for type ${staticName}`;
          } else if (contentItems.length > 1) {
            errorMsg = `Found too many settings for type ${staticName}`;
          } else {
            form = {
              items: [EditPrep.editId(contentItems[0].Id)],
            };
          }
      }

      if (errorMsg) {
        // Navigate to the error component with the error message
        this.#dialogRouter.navParentFirstChild(['message/e'], {
          queryParams: { error: errorMsg },
        });
      } else {
        const formUrl = convertFormToUrl(form);
        this.#dialogRouter.navParentFirstChild([`edit/${formUrl}`]);
      }
    });
  }

  // TODO: @2pp - finish the migration on edit cases
  urlToEdit(staticName: string, systemSettingsScope?: Of<typeof SystemSettingsScopes>) {
    this.#contentItemsService.getAll(staticName).subscribe(contentItems => {
      let form: EditForm;
      let errorMsg: string;

      switch (staticName) {
        case eavConstants.contentTypes.systemSettings:
        case eavConstants.contentTypes.systemResources:
          const systemSettingsEntities = contentItems.filter(i =>
            systemSettingsScope === SystemSettingsScopes.App
              ? !i.SettingsEntityScope
              : i.SettingsEntityScope === SystemSettingsScopes.Site
          );
          if (systemSettingsEntities.length > 1) {
            errorMsg = `Found too many settings for type ${staticName}`;
          } else {
            const systemSettingsEntity = systemSettingsEntities[0];
            form = {
              items: [
                systemSettingsEntity == null
                  ? EditPrep.newFromType(staticName, {
                    ...(systemSettingsScope === SystemSettingsScopes.Site && {
                      SettingsEntityScope: SystemSettingsScopes.Site,
                    }),
                  })
                  : EditPrep.editId(systemSettingsEntity.Id),
              ],
            };
          }
          break;

        case eavConstants.contentTypes.customSettings:
        case eavConstants.contentTypes.customResources:
          if (contentItems.length > 1) {
            errorMsg = `Found too many settings for type ${staticName}`;
          } else {
            const customSettingsEntity = contentItems[0];
            form = {
              items: [
                customSettingsEntity == null
                  ? EditPrep.newFromType(staticName)
                  : EditPrep.editId(customSettingsEntity.Id),
              ],
            };
          }
          break;

        default:
          if (contentItems.length < 1) {
            errorMsg = `Found no settings for type ${staticName}`;
          } else if (contentItems.length > 1) {
            errorMsg = `Found too many settings for type ${staticName}`;
          } else {
            form = {
              items: [EditPrep.editId(contentItems[0].Id)],
            };
          }
      }

      if (errorMsg) {
        // Navigate to the error component with the error message
        this.#dialogRouter.navParentFirstChild(['message/e'], {
          queryParams: { error: errorMsg },
        });

        return '';
      } else {
        return this.#urlTo(
          `edit/${convertFormToUrl(form)}`
        )
      }
    });
  }

  getLightSpeedLink(): string {
    const form = AppAdminHelpers.getLightSpeedEditParams(this.context.appId);
    const formUrl = convertFormToUrl(form);
    const urlString = `edit/${formUrl}`;
    return this.#dialogRouter.urlSubRoute(urlString);
  }

  openSiteSettings() {
    const sitePrimaryApp = this.dialogSettings.Context.Site.PrimaryApp;
    this.#dialogSvc.openAppAdministration(sitePrimaryApp.ZoneId, sitePrimaryApp.AppId, 'app');
  }

  openGlobalSettings() {
    const globalPrimaryApp = this.dialogSettings.Context.System.PrimaryApp;
    this.#dialogSvc.openAppAdministration(globalPrimaryApp.ZoneId, globalPrimaryApp.AppId, 'app');
  }

  // TODO: @2pp - finish the migration on config cases
  // need to find out where the last usecases in UI are
  config(staticName: string) {
    this.#dialogRouter.navParentFirstChild([`fields/${staticName}`]);
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

  fixContentType(staticName: string, action: 'edit' | 'config') {
    this.#contentTypesSvc.retrieveContentTypes(eavConstants.scopes.configuration.value).subscribe(contentTypes => {
      const contentTypeExists = contentTypes.some(ct => ct.Name === staticName);
      if (contentTypeExists) {
        if (action === 'edit') {
          this.edit(staticName);
        } else if (action === 'config') {
          this.config(staticName);
        }
      } else {
        const newContentType = {
          StaticName: '',
          Name: staticName,
          Description: '',
          Scope: eavConstants.scopes.configuration.value,
          ChangeStaticName: false,
          NewStaticName: '',
        } as ContentTypeEdit;
        this.#contentTypesSvc.save(newContentType).subscribe(success => {
          if (!success) return;

          if (action === 'edit') {
            this.edit(staticName);
          } else if (action === 'config') {
            this.config(staticName);
          }
        });
      }
    });
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
