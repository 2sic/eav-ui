import { ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewContainerRef } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { ContentItemsService } from '../../content-items/services/content-items.service';
import { GlobalConfigService } from '../../edit/shared/store/ngrx-data';
import { GoToPermissions } from '../../permissions/go-to-permissions';
import { BaseWithChildDialogComponent } from '../../shared/components/base-component/base-with-child-dialog.component';
import { eavConstants, SystemSettingsScope, SystemSettingsScopes } from '../../shared/constants/eav.constants';
import { convertFormToUrl } from '../../shared/helpers/url-prep.helper';
import { AppScopes } from '../../shared/models/dialog-context.models';
import { DialogSettings } from '../../shared/models/dialog-settings.model';
import { EditForm } from '../../shared/models/edit-form.model';
import { Context } from '../../shared/services/context';
import { DialogService } from '../../shared/services/dialog.service';
import { FeaturesService } from '../../shared/services/features.service';
import { AppAdminHelpers } from '../app-admin-helpers';
import { ContentTypeEdit } from '../models';
import { AppDialogConfigService, ContentTypesService } from '../services';
import { AppInternalsService } from '../services/app-internals.service';
import { ImportAppPartsService } from '../services/import-app-parts.service';
import { AnalyzePart, AnalyzeParts } from '../sub-dialogs/analyze-settings/analyze-settings.models';
import { Subject, Observable, combineLatest, map } from 'rxjs';
import { AppInternals } from '../models/app-internals.model';
import { FeatureNames } from '../../features/feature-names';
import { FeatureComponentBase } from '../../features/shared/base-feature.component';
import { MatDialog } from '@angular/material/dialog';
import { FeatureTextInfoComponent } from '../../features/feature-text-info/feature-text-info.component';
import { AppConfigurationCardComponent } from './app-configuration-card/app-configuration-card.component';
import { NgTemplateOutlet, AsyncPipe } from '@angular/common';
import { MatBadgeModule } from '@angular/material/badge';
import { SharedComponentsModule } from '../../shared/shared-components.module';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { FeatureDetailService } from '../../features/services/feature-detail.service';

@Component({
  selector: 'app-app-configuration',
  templateUrl: './app-configuration.component.html',
  styleUrls: ['./app-configuration.component.scss'],
  standalone: true,
  imports: [
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    SharedComponentsModule,
    MatBadgeModule,
    NgTemplateOutlet,
    AppConfigurationCardComponent,
    FeatureTextInfoComponent,
    RouterOutlet,
    AsyncPipe,
  ],
  providers: [FeatureDetailService ],
})
export class AppConfigurationComponent extends BaseWithChildDialogComponent implements OnInit, OnDestroy {
  dialogSettings: DialogSettings;

  eavConstants = eavConstants;
  AnalyzeParts = AnalyzeParts;
  SystemSettingsScopes = SystemSettingsScopes;
  AppScopes = AppScopes;
  isGlobal: boolean;
  isPrimary: boolean;
  isApp: boolean;
  debugEnabled$ = this.globalConfigService.getDebugEnabled$();

  // More proper ViewModel
  appSettingsInternal$ = new Subject<AppInternals>();
  viewModel$: Observable<AppConfigurationViewModel>;

  public appStateAdvanced = false;

  public features: FeaturesService = new FeaturesService();

  constructor(
    protected router: Router,
    protected route: ActivatedRoute,
    private contentItemsService: ContentItemsService,
    private context: Context,
    private importAppPartsService: ImportAppPartsService,
    private snackBar: MatSnackBar,
    private dialogService: DialogService,
    private appInternalsService: AppInternalsService,
    private contentTypesService: ContentTypesService,
    private globalConfigService: GlobalConfigService,
    private appDialogConfigService: AppDialogConfigService,
    private dialog: MatDialog,
    private viewContainerRef: ViewContainerRef,
    private changeDetectorRef: ChangeDetectorRef,
  ) {
    super(router, route);
    this.features.loadFromService(appDialogConfigService);

    // New with proper ViewModel
    this.viewModel$ = combineLatest([
      this.appSettingsInternal$,
      this.features.isEnabled$(FeatureNames.LightSpeed),
      this.features.isEnabled$(FeatureNames.ContentSecurityPolicy),
      this.features.isEnabled$(FeatureNames.PermissionsByLanguage),
    ]).pipe(map(([settings, lightSpeedEnabled, cspEnabled, langPermsEnabled]) => {
      const result: AppConfigurationViewModel = {
        lightSpeedEnabled,
        cspEnabled,
        langPermsEnabled,
        appLightSpeedCount: settings.MetadataList.Items.filter(i => i._Type.Name == eavConstants.appMetadata.LightSpeed.ContentTypeName).length,
        systemSettingsCount: this.isPrimary
          ? settings.EntityLists.SettingsSystem.filter(i => i.SettingsEntityScope === SystemSettingsScopes.Site).length
          : settings.EntityLists.SettingsSystem.filter(i => !i.SettingsEntityScope).length,
        customSettingsCount: settings.EntityLists.AppSettings?.length,
        customSettingsFieldsCount: settings.FieldAll.AppSettings?.length,
        systemResourcesCount: this.isPrimary
          ? settings.EntityLists.ResourcesSystem.filter(i => i.SettingsEntityScope === SystemSettingsScopes.Site).length
          : settings.EntityLists.ResourcesSystem.filter(i => !i.SettingsEntityScope).length,
        customResourcesCount: settings.EntityLists.AppResources?.length,
        customResourcesFieldsCount: settings.FieldAll.AppResources?.length,
      }
      return result;
    }));
  }


  ngOnInit() {
    this.fetchSettings();
    this.subscription.add(this.childDialogClosed$().subscribe(() => { this.fetchSettings(); }));

    this.appDialogConfigService.getCurrent$().subscribe((dialogSettings) => {
      this.dialogSettings = dialogSettings;
      const appScope = dialogSettings.Context.App.SettingsScope;
      this.isGlobal = appScope === AppScopes.Global;
      this.isPrimary = appScope === AppScopes.Site;
      this.isApp = appScope === AppScopes.App;
    });
  }

  ngOnDestroy() {
    this.snackBar.dismiss();
    super.ngOnDestroy();
  }

  edit(staticName: string, systemSettingsScope?: SystemSettingsScope) {
    this.contentItemsService.getAll(staticName).subscribe(contentItems => {
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
                ? {
                  ContentTypeName: staticName,
                  Prefill: {
                    ...(systemSettingsScope === SystemSettingsScopes.Site && { SettingsEntityScope: SystemSettingsScopes.Site }),
                  }
                }
                : { EntityId: systemSettingsEntity.Id }
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
                ? { ContentTypeName: staticName }
                : { EntityId: customSettingsEntity.Id }
            ],
          };
          break;
        default:
          if (contentItems.length < 1) throw new Error(`Found no settings for type ${staticName}`);
          if (contentItems.length > 1) throw new Error(`Found too many settings for type ${staticName}`);
          form = {
            items: [{ EntityId: contentItems[0].Id }],
          };
      }

      const formUrl = convertFormToUrl(form);
      this.router.navigate([`edit/${formUrl}`], { relativeTo: this.route.parent.firstChild });
    });
  }

  openLightSpeed() {
    const form = AppAdminHelpers.getLightSpeedEditParams(this.context.appId);
    const formUrl = convertFormToUrl(form);
    this.router.navigate([`edit/${formUrl}`], { relativeTo: this.route.parent.firstChild });
  }

  openSiteSettings() {
    const sitePrimaryApp = this.dialogSettings.Context.Site.PrimaryApp;
    this.dialogService.openAppAdministration(sitePrimaryApp.ZoneId, sitePrimaryApp.AppId, 'app');
  }

  openGlobalSettings() {
    const globalPrimaryApp = this.dialogSettings.Context.System.PrimaryApp;
    this.dialogService.openAppAdministration(globalPrimaryApp.ZoneId, globalPrimaryApp.AppId, 'app');
  }

  config(staticName: string) {
    this.router.navigate([`fields/${staticName}`], { relativeTo: this.route.parent.firstChild });
  }

  openPermissions() {
    this.router.navigate([GoToPermissions.getUrlApp(this.context.appId)], { relativeTo: this.route.parent.firstChild });
  }

  openLanguagePermissions(enabled: boolean) {
    if (enabled)
      this.router.navigate(['language-permissions'], { relativeTo: this.route.parent.firstChild });
    else
      FeatureComponentBase.openDialog(this.dialog, FeatureNames.PermissionsByLanguage, this.viewContainerRef, this.changeDetectorRef);
  }

  analyze(part: AnalyzePart) {
    this.router.navigate([`analyze/${part}`], { relativeTo: this.route.parent.firstChild });
  }

  private fetchSettings() {
    const getObservable = this.appInternalsService.getAppInternals(eavConstants.metadata.app.targetType, eavConstants.metadata.app.keyType, this.context.appId);
    getObservable.subscribe(x => {
      // 2dm - New mode for Reactive UI
      this.appSettingsInternal$.next(x);
    });
  }

  fixContentType(staticName: string, action: 'edit' | 'config') {
    this.contentTypesService.retrieveContentTypes(eavConstants.scopes.configuration.value).subscribe(contentTypes => {
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
        this.contentTypesService.save(newContentType).subscribe(success => {
          if (!success) { return; }

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
  lightSpeedEnabled: boolean;
  appLightSpeedCount: number;

  // CSP
  cspEnabled: boolean;

  // Language Permissions
  langPermsEnabled: boolean;

  systemSettingsCount: number;
  customSettingsCount: number;
  customSettingsFieldsCount: number;
  systemResourcesCount: number;
  customResourcesCount: number;
  customResourcesFieldsCount: number;
}
