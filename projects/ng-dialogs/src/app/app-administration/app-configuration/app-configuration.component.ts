import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { forkJoin, of, Subscription } from 'rxjs';
import { filter, map, pairwise, startWith } from 'rxjs/operators';
import { ContentItemsService } from '../../content-items/services/content-items.service';
import { ContentTypesFieldsService } from '../../content-type-fields/services/content-types-fields.service';
import { GoToMetadata } from '../../metadata';
import { MetadataService } from '../../permissions';
import { GoToPermissions } from '../../permissions/go-to-permissions';
import { eavConstants, SystemSettingsScope, SystemSettingsScopes } from '../../shared/constants/eav.constants';
import { convertFormToUrl } from '../../shared/helpers/url-prep.helper';
import { AppScopes } from '../../shared/models/dialog-context.models';
import { EditForm } from '../../shared/models/edit-form.model';
import { Context } from '../../shared/services/context';
import { DialogService } from '../../shared/services/dialog.service';
import { DialogSettings } from '../models/dialog-settings.model';
import { ExportAppService } from '../services/export-app.service';
import { ImportAppPartsService } from '../services/import-app-parts.service';
import { AnalyzePart, AnalyzeParts } from '../sub-dialogs/analyze-settings/analyze-settings.models';

@Component({
  selector: 'app-app-configuration',
  templateUrl: './app-configuration.component.html',
  styleUrls: ['./app-configuration.component.scss'],
})
export class AppConfigurationComponent implements OnInit, OnDestroy {
  @Input() dialogSettings: DialogSettings;
  eavConstants = eavConstants;
  AnalyzeParts = AnalyzeParts;
  SystemSettingsScopes = SystemSettingsScopes;
  AppScopes = AppScopes;
  appSystemSettings: number;
  appCustomSettings: number;
  appCustomSettingsFields: number;
  appSystemResources: number;
  appCustomResources: number;
  appCustomResourcesFields: number;
  siteSystemSettings: number;
  siteSystemResources: number;
  appConfigurations: number;
  appMetadata: number;

  private subscription: Subscription;

  constructor(
    private contentItemsService: ContentItemsService,
    private router: Router,
    private route: ActivatedRoute,
    private context: Context,
    private exportAppService: ExportAppService,
    private importAppPartsService: ImportAppPartsService,
    private snackBar: MatSnackBar,
    private dialogService: DialogService,
    private changeDetectorRef: ChangeDetectorRef,
    private contentTypesFieldsService: ContentTypesFieldsService,
    private metadataService: MetadataService,
  ) { }

  ngOnInit() {
    this.subscription = new Subscription();
    this.fetchSystemSettings();
    this.refreshOnChildClosed();
  }

  ngOnDestroy() {
    this.snackBar.dismiss();
    this.subscription.unsubscribe();
  }

  edit(staticName: string, systemSettingsScope?: SystemSettingsScope) {
    this.contentItemsService.getAll(staticName).subscribe(contentItems => {
      let form: EditForm;

      switch (staticName) {
        case eavConstants.contentTypes.systemSettings:
        case eavConstants.contentTypes.systemResources:
          const settingsEntity = contentItems.find(i => systemSettingsScope === SystemSettingsScopes.App
            ? !i.SettingsEntityScope
            : i.SettingsEntityScope === SystemSettingsScopes.Site);
          form = {
            items: [
              settingsEntity == null
                ? {
                  ContentTypeName: staticName,
                  Prefill: {
                    ...(systemSettingsScope === SystemSettingsScopes.Site && { SettingsEntityScope: SystemSettingsScopes.Site }),
                  }
                }
                : { EntityId: settingsEntity.Id }
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
    const siteDefaultApp = this.dialogSettings.Context.Site.DefaultApp;
    this.dialogService.openAppAdministration(siteDefaultApp.ZoneId, siteDefaultApp.AppId, 'app');
  }

  openGlobalSettings() {
    const globalDefaultApp = this.dialogSettings.Context.System.DefaultApp;
    this.dialogService.openAppAdministration(globalDefaultApp.ZoneId, globalDefaultApp.AppId, 'app');
  }

  config(staticName: string) {
    this.router.navigate([`fields/${staticName}`], { relativeTo: this.route.firstChild });
  }

  openPermissions() {
    this.router.navigate([GoToPermissions.getUrlApp(this.context.appId)], { relativeTo: this.route.firstChild });
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

  exportAppXml() {
    this.snackBar.open('Exporting...');
    this.exportAppService.exportForVersionControl(true, false).subscribe({
      next: result => {
        this.snackBar.open('Export done. Please check your \'.data\' folder', null, { duration: 3000 });
      },
      error: (error: HttpErrorResponse) => {
        this.snackBar.open('Export failed. Please check console for more information', null, { duration: 3000 });
      },
    });
  }

  resetApp() {
    if (!confirm('Are you sure? All changes since last xml export will be lost')) { return; }
    this.snackBar.open('Resetting...');
    this.importAppPartsService.resetApp().subscribe({
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

  private fetchSystemSettings() {
    // custom settings and custom resources don't work for global scope
    const isGlobalScope = this.dialogSettings.Context.App.SettingsScope === AppScopes.Global;
    forkJoin([
      forkJoin([
        this.contentItemsService.getAll(eavConstants.contentTypes.systemSettings),
        isGlobalScope ? of<undefined>(undefined) : this.contentItemsService.getAll(eavConstants.contentTypes.settings),
        isGlobalScope ? of<undefined>(undefined) : this.contentTypesFieldsService.getFields(eavConstants.contentTypes.settings),
      ]),
      forkJoin([
        this.contentItemsService.getAll(eavConstants.contentTypes.systemResources),
        isGlobalScope ? of<undefined>(undefined) : this.contentItemsService.getAll(eavConstants.contentTypes.resources),
        isGlobalScope ? of<undefined>(undefined) : this.contentTypesFieldsService.getFields(eavConstants.contentTypes.resources),
      ]),
      forkJoin([
        this.contentItemsService.getAll(eavConstants.scopes.app.value),
        this.metadataService.getMetadata(eavConstants.metadata.app.type, eavConstants.metadata.app.keyType, this.context.appId),
      ]),
    ]).subscribe(([
      [
        systemSettingsItems,
        customSettingsItems,
        customSettingsFields,
      ],
      [
        systemResourcesItems,
        customResourcesItems,
        customResourcesFields,
      ],
      [
        appConfigurations,
        appMetadata,
      ],
    ]) => {
      this.appSystemSettings = systemSettingsItems.filter(i => !i.SettingsEntityScope).length;
      this.appCustomSettings = customSettingsItems?.length;
      this.appCustomSettingsFields = customSettingsFields?.length;
      this.appSystemResources = systemResourcesItems.filter(i => !i.SettingsEntityScope).length;
      this.appCustomResources = customResourcesItems?.length;
      this.appCustomResourcesFields = customResourcesFields?.length;
      this.siteSystemSettings = systemSettingsItems.filter(i => i.SettingsEntityScope === SystemSettingsScopes.Site).length;
      this.siteSystemResources = systemResourcesItems.filter(i => i.SettingsEntityScope === SystemSettingsScopes.Site).length;
      this.appConfigurations = appConfigurations.length;
      this.appMetadata = appMetadata.Items.length;

      this.changeDetectorRef.markForCheck();
    });
  }

  private refreshOnChildClosed() {
    this.subscription.add(
      this.router.events.pipe(
        filter(event => event instanceof NavigationEnd),
        startWith(!!this.route.snapshot.firstChild.firstChild),
        map(() => !!this.route.snapshot.firstChild.firstChild),
        pairwise(),
        filter(([hadChild, hasChild]) => hadChild && !hasChild),
      ).subscribe(() => {
        this.fetchSystemSettings();
      })
    );
  }
}
