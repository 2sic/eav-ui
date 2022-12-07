import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { ContentItemsService } from '../../content-items/services/content-items.service';
import { GlobalConfigService } from '../../edit/shared/store/ngrx-data';
import { GoToMetadata } from '../../metadata';
import { GoToPermissions } from '../../permissions/go-to-permissions';
import { BaseComponent } from '../../shared/components/base-component/base.component';
import { eavConstants, SystemSettingsScope, SystemSettingsScopes } from '../../shared/constants/eav.constants';
import { convertFormToUrl } from '../../shared/helpers/url-prep.helper';
import { AppScopes } from '../../shared/models/dialog-context.models';
import { DialogSettings } from '../../shared/models/dialog-settings.model';
import { EditForm } from '../../shared/models/edit-form.model';
import { Context } from '../../shared/services/context';
import { DialogService } from '../../shared/services/dialog.service';
import { FeaturesService } from '../../shared/services/features.service';
import { ContentTypeEdit } from '../models';
import { AppDialogConfigService, ContentTypesService } from '../services';
import { AppInternalsService } from '../services/app-internals.service';
import { ExportAppService } from '../services/export-app.service';
import { ImportAppPartsService } from '../services/import-app-parts.service';
import { AnalyzePart, AnalyzeParts } from '../sub-dialogs/analyze-settings/analyze-settings.models';

@Component({
  selector: 'app-app-configuration',
  templateUrl: './app-configuration.component.html',
  styleUrls: ['./app-configuration.component.scss'],
})
export class AppConfigurationComponent extends BaseComponent implements OnInit, OnChanges, OnDestroy {
  @Input() dialogSettings: DialogSettings;

  eavConstants = eavConstants;
  AnalyzeParts = AnalyzeParts;
  SystemSettingsScopes = SystemSettingsScopes;
  AppScopes = AppScopes;
  isGlobal: boolean;
  isPrimary: boolean;
  isApp: boolean;
  systemSettingsCount: number;
  customSettingsCount: number;
  customSettingsFieldsCount: number;
  systemResourcesCount: number;
  customResourcesCount: number;
  customResourcesFieldsCount: number;
  appConfigurationsCount: number;
  appMetadataCount: number;
  debugEnabled$ = this.globalConfigService.getDebugEnabled$();

  public appStateAdvanced = false;

  public features: FeaturesService = new FeaturesService();

  constructor(
    private contentItemsService: ContentItemsService,
    router: Router,
    route: ActivatedRoute,
    private context: Context,
    private exportAppService: ExportAppService,
    private importAppPartsService: ImportAppPartsService,
    private snackBar: MatSnackBar,
    private dialogService: DialogService,
    private appInternalsService: AppInternalsService,
    private contentTypesService: ContentTypesService,
    private globalConfigService: GlobalConfigService,
    appDialogConfigService: AppDialogConfigService,
  ) {
    super(router, route);
    this.features.loadFromService(appDialogConfigService);
  }


  ngOnInit() {
    this.fetchSettings();
    this.subscription.add(this.refreshOnChildClosed().subscribe(() => { this.fetchSettings(); }));
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.dialogSettings != null) {
      this.isGlobal = this.dialogSettings.Context.App.SettingsScope === AppScopes.Global;
      this.isPrimary = this.dialogSettings.Context.App.SettingsScope === AppScopes.Site;
      this.isApp = this.dialogSettings.Context.App.SettingsScope === AppScopes.App;
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
          if (contentItems.length < 1) {
            throw new Error(`Found no settings for type ${staticName}`);
          }
          if (contentItems.length > 1) {
            throw new Error(`Found too many settings for type ${staticName}`);
          }
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

  openSiteSettings() {
    const sitePrimaryApp = this.dialogSettings.Context.Site.PrimaryApp;
    this.dialogService.openAppAdministration(sitePrimaryApp.ZoneId, sitePrimaryApp.AppId, 'app');
  }

  openGlobalSettings() {
    const globalPrimaryApp = this.dialogSettings.Context.System.PrimaryApp;
    this.dialogService.openAppAdministration(globalPrimaryApp.ZoneId, globalPrimaryApp.AppId, 'app');
  }

  config(staticName: string) {
    this.router.navigate([`fields/${staticName}`], { relativeTo: this.route.firstChild });
  }

  openPermissions() {
    this.router.navigate([GoToPermissions.getUrlApp(this.context.appId)], { relativeTo: this.route.firstChild });
  }

  openLanguagePermissions() {
    this.router.navigate(['language-permissions'], { relativeTo: this.route.firstChild });
  }

  exportApp() {
    this.router.navigate([`export`], { relativeTo: this.route.firstChild });
  }

  exportParts() {
    this.router.navigate([`export/parts`], { relativeTo: this.route.firstChild });
  }

  importParts() {
    this.router.navigate([`import/parts`], { relativeTo: this.route.firstChild });
  }

  exportAppXml(withFiles: boolean) {
    this.snackBar.open('Exporting...');
    this.exportAppService.exportForVersionControl({ includeContentGroups: true, resetAppGuid: false, withFiles }).subscribe({
      next: result => {
        this.snackBar.open('Export completed into the \'App_Data\' folder.', null, { duration: 3000 });
      },
      error: (error: HttpErrorResponse) => {
        this.snackBar.open('Export failed. Please check console for more information', null, { duration: 3000 });
      },
    });
  }

  resetApp(withFiles: boolean) {
    if (!confirm('Are you sure? All changes since last xml export will be lost')) { return; }
    this.snackBar.open('Resetting...');
    this.importAppPartsService.resetApp(withFiles).subscribe({
      next: result => {
        this.snackBar.open(
          'Reset worked! Since this is a complex operation, please restart the Website to ensure all caches are correct',
          null,
          { duration: 30000 },
        );
      },
      error: (error: HttpErrorResponse) => {
        this.snackBar.open('Reset failed. Please check console for more information', null, { duration: 3000 });
      },
    });
  }

  analyze(part: AnalyzePart) {
    this.router.navigate([`analyze/${part}`], { relativeTo: this.route.firstChild });
  }

  private fetchSettings() {
    this.appInternalsService.getAppInternals(eavConstants.metadata.app.targetType, eavConstants.metadata.app.keyType, this.context.appId)
      .subscribe(x => {
        this.systemSettingsCount = this.isPrimary
          ? x.EntityLists.SettingsSystem.filter(i => i.SettingsEntityScope === SystemSettingsScopes.Site).length
          : x.EntityLists.SettingsSystem.filter(i => !i.SettingsEntityScope).length;
        this.customSettingsCount = x.EntityLists.AppSettings?.length;
        this.customSettingsFieldsCount = x.FieldAll.AppSettings?.length;
        this.systemResourcesCount = this.isPrimary
          ? x.EntityLists.ResourcesSystem.filter(i => i.SettingsEntityScope === SystemSettingsScopes.Site).length
          : x.EntityLists.ResourcesSystem.filter(i => !i.SettingsEntityScope).length;
        this.customResourcesCount = x.EntityLists.AppResources?.length;
        this.customResourcesFieldsCount = x.FieldAll.AppResources?.length;
        this.appConfigurationsCount = x.EntityLists.ToSxcContentApp.length;
        this.appMetadataCount = x.MetadataList.Items.length;
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
