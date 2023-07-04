import { ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewContainerRef } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { ContentItemsService } from '../../content-items/services/content-items.service';
import { GoToMetadata } from '../../metadata';
import { GoToPermissions } from '../../permissions/go-to-permissions';
import { BaseComponent } from '../../shared/components/base-component/base.component';
import { eavConstants, SystemSettingsScope, SystemSettingsScopes } from '../../shared/constants/eav.constants';
import { convertFormToUrl } from '../../shared/helpers/url-prep.helper';
import { AppScopes } from '../../shared/models/dialog-context.models';
import { DialogSettings } from '../../shared/models/dialog-settings.model';
import { EditForm } from '../../shared/models/edit-form.model';
import { Context } from '../../shared/services/context';
import { FeaturesService } from '../../shared/services/features.service';
import { AppAdminHelpers } from '../app-admin-helpers';
import { AppDialogConfigService } from '../services';
import { AppInternalsService } from '../services/app-internals.service';
import { Subject, Observable, combineLatest, map } from 'rxjs';
import { AppInternals } from '../models/app-internals.model';
import { FeatureNames } from '../../features/feature-names';
import { FeatureComponentBase } from '../../features/shared/base-feature.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-app-security-configuration',
  templateUrl: './app-security-configuration.component.html',
  styleUrls: ['./app-security-configuration.component.scss'],
})
export class AppSecurityConfigurationComponent extends BaseComponent implements OnInit, OnChanges, OnDestroy {
  @Input() dialogSettings: DialogSettings;

  eavConstants = eavConstants;
  isGlobal: boolean;
  isApp: boolean;

  // More proper ViewModel
  appSettingsInternal$ = new Subject<AppInternals>();
  data$: Observable<ViewModel>;

  public features: FeaturesService = new FeaturesService();

  constructor(
    protected router: Router,
    protected route: ActivatedRoute,
    private contentItemsService: ContentItemsService,
    private context: Context,
    private snackBar: MatSnackBar,
    private appInternalsService: AppInternalsService,
    appDialogConfigService: AppDialogConfigService,
    private dialog: MatDialog,
    private viewContainerRef: ViewContainerRef,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    super(router, route);
    this.features.loadFromService(appDialogConfigService);

    // New with proper ViewModel
    this.data$ = combineLatest([
      this.appSettingsInternal$,
      this.features.isEnabled$(FeatureNames.LightSpeed),
      this.features.isEnabled$(FeatureNames.PermissionsByLanguage),
    ]).pipe(map(([settings, lightSpeedEnabled, langPermsEnabled]) => {
      const result: ViewModel = {
        lightSpeedEnabled,
        langPermsEnabled,
        appLightSpeedCount: settings.MetadataList.Items.filter(i => i._Type.Name == eavConstants.appMetadata.LightSpeed.ContentTypeName).length,
        appConfigurationsCount: settings.EntityLists.ToSxcContentApp.length,
        appMetadataCount: settings.MetadataList.Items.length,
      }
      return result;
    }));
  }


  ngOnInit() {
    this.fetchSettings();
    this.subscription.add(this.refreshOnChildClosedDeep().subscribe(() => { this.fetchSettings(); }));
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.dialogSettings != null) {
      const appScope = this.dialogSettings.Context.App.SettingsScope;
      this.isGlobal = appScope === AppScopes.Global;
      this.isApp = appScope === AppScopes.App;
    }
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
      this.router.navigate([`edit/${formUrl}`], { relativeTo: this.route.firstChild });
    });
  }

  openMetadata() {
    const url = GoToMetadata.getUrlApp(
      this.context.appId,
      `Metadata for App: ${this.dialogSettings.Context.App.Name} (${this.context.appId})`,
    );
    this.router.navigate([url], { relativeTo: this.route.firstChild });
  }

  openLightSpeed() {
    const form = AppAdminHelpers.getLightSpeedEditParams(this.context.appId);
    const formUrl = convertFormToUrl(form);
    this.router.navigate([`edit/${formUrl}`], { relativeTo: this.route.firstChild });
  }

  openPermissions() {
    this.router.navigate([GoToPermissions.getUrlApp(this.context.appId)], { relativeTo: this.route.firstChild });
  }

  openLanguagePermissions(enabled: boolean) {
    if (enabled)
      this.router.navigate(['language-permissions'], { relativeTo: this.route.firstChild });
    else
      FeatureComponentBase.openDialog(this.dialog, FeatureNames.PermissionsByLanguage, this.viewContainerRef, this.changeDetectorRef);
  }

  private fetchSettings() {
    const getObservable = this.appInternalsService.getAppInternals(eavConstants.metadata.app.targetType, eavConstants.metadata.app.keyType, this.context.appId);
    getObservable.subscribe(x => {
      // 2dm - New mode for Reactive UI
      this.appSettingsInternal$.next(x);
      });
  }
}

class ViewModel {
  // Lightspeed
  lightSpeedEnabled: boolean;
  appLightSpeedCount: number;

  // Language Permissions
  langPermsEnabled: boolean;

  appConfigurationsCount: number;
  appMetadataCount: number;
}