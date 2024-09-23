import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewContainerRef, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterOutlet } from '@angular/router';
import { ContentItemsService } from '../../content-items/services/content-items.service';
import { GoToPermissions } from '../../permissions/go-to-permissions';
import { eavConstants, SystemSettingsScope, SystemSettingsScopes } from '../../shared/constants/eav.constants';
import { convertFormToUrl } from '../../shared/helpers/url-prep.helper';
import { AppScopes } from '../../shared/models/dialog-context.models';
import { DialogSettings } from '../../shared/models/dialog-settings.model';
import { EditForm, EditPrep } from '../../shared/models/edit-form.model';
import { Context } from '../../shared/services/context';
import { DialogService } from '../../shared/services/dialog.service';
import { FeaturesScopedService } from '../../features/features-scoped.service';
import { AppAdminHelpers } from '../app-admin-helpers';
import { ContentTypeEdit } from '../models';
import { ContentTypesService } from '../services';
import { AppInternalsService } from '../services/app-internals.service';
import { AnalyzePart, AnalyzeParts } from '../sub-dialogs/analyze-settings/analyze-settings.models';
import { Subject, Observable, map } from 'rxjs';
import { AppInternals } from '../models/app-internals.model';
import { FeatureNames } from '../../features/feature-names';
import { openFeatureDialog } from '../../features/shared/base-feature.component';
import { MatDialog } from '@angular/material/dialog';
import { FeatureTextInfoComponent } from '../../features/feature-text-info/feature-text-info.component';
import { AppConfigurationCardComponent } from './app-configuration-card/app-configuration-card.component';
import { NgTemplateOutlet, AsyncPipe } from '@angular/common';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { TippyDirective } from '../../shared/directives/tippy.directive';
import { transient } from '../../core';
import { DialogConfigAppService } from '../services/dialog-config-app.service';
import { DialogRoutingService } from '../../shared/routing/dialog-routing.service';

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
  viewModel$: Observable<AppConfigurationViewModel>;

  public appStateAdvanced = false;
  public features = inject(FeaturesScopedService);

  protected lightSpeedEnabled = this.features.enabled[FeatureNames.LightSpeed];
  protected cspEnabled = this.features.enabled[FeatureNames.ContentSecurityPolicy];
  protected langPermsEnabled = this.features.enabled[FeatureNames.PermissionsByLanguage];

  #appInternalsService = transient(AppInternalsService);

  #contentItemsService = transient(ContentItemsService);

  #dialogConfigSvc = transient(DialogConfigAppService);
  #dialogRouter = transient(DialogRoutingService);

  constructor(
    private context: Context,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private viewContainerRef: ViewContainerRef,
    private changeDetectorRef: ChangeDetectorRef,
  ) {
    // New with proper ViewModel
    this.viewModel$ = this.appSettingsInternal$.pipe(
      map(s => {
        const props = s.EntityLists;
        const lsTypeName = eavConstants.appMetadata.LightSpeed.ContentTypeName;
        const result: AppConfigurationViewModel = {
          appLightSpeedCount: s.MetadataList.Items.filter(i => i._Type.Name == lsTypeName).length,
          systemSettingsCount: this.isPrimary
            ? props.SettingsSystem.filter(i => i.SettingsEntityScope === SystemSettingsScopes.Site).length
            : props.SettingsSystem.filter(i => !i.SettingsEntityScope).length,
          customSettingsCount: props.AppSettings?.length,
          customSettingsFieldsCount: s.FieldAll.AppSettings?.length,
          systemResourcesCount: this.isPrimary
            ? props.ResourcesSystem.filter(i => i.SettingsEntityScope === SystemSettingsScopes.Site).length
            : props.ResourcesSystem.filter(i => !i.SettingsEntityScope).length,
          customResourcesCount: props.AppResources?.length,
          customResourcesFieldsCount: s.FieldAll.AppResources?.length,
        }
        return result;
      }));
  }


  ngOnInit() {
    this.fetchSettings();
    this.#dialogRouter.doOnDialogClosed(() => this.fetchSettings());

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

  edit(staticName: string, systemSettingsScope?: SystemSettingsScope) {
    this.#contentItemsService.getAll(staticName).subscribe(contentItems => {
      let form: EditForm;

      switch (staticName) {
        case eavConstants.contentTypes.systemSettings:
        case eavConstants.contentTypes.systemResources:
          const systemSettingsEntities = contentItems.filter(i => systemSettingsScope === SystemSettingsScopes.App
            ? !i.SettingsEntityScope
            : i.SettingsEntityScope === SystemSettingsScopes.Site);
          if (systemSettingsEntities.length > 1) {
            throw new Error(`Found too many settings for type ${staticName}`);
          }
          const systemSettingsEntity = systemSettingsEntities[0];
          form = {
            items: [
              systemSettingsEntity == null
                ? EditPrep.newFromType(staticName, {
                    ...(systemSettingsScope === SystemSettingsScopes.Site && { SettingsEntityScope: SystemSettingsScopes.Site }),
                  })
                : EditPrep.editId(systemSettingsEntity.Id)
            ],
          };
          break;
        case eavConstants.contentTypes.customSettings:
        case eavConstants.contentTypes.customResources:
          if (contentItems.length > 1) {
            throw new Error(`Found too many settings for type ${staticName}`);
          }
          const customSettingsEntity = contentItems[0];
          form = {
            items: [
              customSettingsEntity == null
                ? EditPrep.newFromType(staticName)
                : EditPrep.editId(customSettingsEntity.Id)
            ],
          };
          break;
        default:
          if (contentItems.length < 1) throw new Error(`Found no settings for type ${staticName}`);
          if (contentItems.length > 1) throw new Error(`Found too many settings for type ${staticName}`);
          form = {
            items: [EditPrep.editId(contentItems[0].Id)],
          };
      }

      const formUrl = convertFormToUrl(form);
      this.#dialogRouter.navParentFirstChild([`edit/${formUrl}`]);
    });
  }

  openLightSpeed() {
    const form = AppAdminHelpers.getLightSpeedEditParams(this.context.appId);
    const formUrl = convertFormToUrl(form);
    this.#dialogRouter.navParentFirstChild([`edit/${formUrl}`]);
  }

  openSiteSettings() {
    const sitePrimaryApp = this.dialogSettings.Context.Site.PrimaryApp;
    this.#dialogSvc.openAppAdministration(sitePrimaryApp.ZoneId, sitePrimaryApp.AppId, 'app');
  }

  openGlobalSettings() {
    const globalPrimaryApp = this.dialogSettings.Context.System.PrimaryApp;
    this.#dialogSvc.openAppAdministration(globalPrimaryApp.ZoneId, globalPrimaryApp.AppId, 'app');
  }

  config(staticName: string) {
    this.#dialogRouter.navParentFirstChild([`fields/${staticName}`]);
  }

  openPermissions() {
    this.#dialogRouter.navParentFirstChild([GoToPermissions.getUrlApp(this.context.appId)]);
  }

  openLanguagePermissions(enabled: boolean) {
    if (enabled)
      this.#dialogRouter.navParentFirstChild(['language-permissions']);
    else
      openFeatureDialog(this.dialog, FeatureNames.PermissionsByLanguage, this.viewContainerRef, this.changeDetectorRef);
  }

  analyze(part: AnalyzePart) {
    this.#dialogRouter.navParentFirstChild([`analyze/${part}`]);
  }

  private fetchSettings() {
    const getObservable = this.#appInternalsService.getAppInternals();
    getObservable.subscribe(x => {
      // 2dm - New mode for Reactive UI
      this.appSettingsInternal$.next(x);
    });
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
