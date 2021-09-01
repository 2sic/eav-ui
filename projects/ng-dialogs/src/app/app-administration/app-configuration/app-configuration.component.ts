import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { ContentItemsService } from '../../content-items/services/content-items.service';
import { GoToPermissions } from '../../permissions/go-to-permissions';
import { eavConstants } from '../../shared/constants/eav.constants';
import { convertFormToUrl } from '../../shared/helpers/url-prep.helper';
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
  isContentApp: boolean;

  constructor(
    private contentItemsService: ContentItemsService,
    private router: Router,
    private route: ActivatedRoute,
    private context: Context,
    private exportAppService: ExportAppService,
    private importAppPartsService: ImportAppPartsService,
    private snackBar: MatSnackBar,
    private dialogService: DialogService,
  ) { }

  ngOnInit() {
    this.isContentApp = this.dialogSettings.Context.App.Identifier === 'Default';
  }

  ngOnDestroy() {
    this.snackBar.dismiss();
  }

  edit(staticName: string, settingsType?: 'app' | 'site') {
    this.contentItemsService.getAll(staticName).subscribe(contentItems => {
      let form: EditForm;

      switch (staticName) {
        case eavConstants.contentTypes.systemSettings:
        case eavConstants.contentTypes.systemResources:
          const settingsEntity = contentItems.find(i => settingsType === 'app' ? !i.SettingsEntityScope : i.SettingsEntityScope === 'site');
          form = {
            items: [
              settingsEntity == null
                ? { ContentTypeName: staticName, Prefill: { ...(settingsType === 'site' && { SettingsEntityScope: 'site' }) } }
                : { EntityId: settingsEntity.Id }
            ],
          };
          break;
        default:
          if (contentItems.length !== 1) {
            throw new Error(`Found too many settings for the type ${staticName}`);
          }
          form = {
            items: [{ EntityId: contentItems[0].Id }],
          };
      }

      const formUrl = convertFormToUrl(form);
      this.router.navigate([`edit/${formUrl}`], { relativeTo: this.route.firstChild });
    });
  }

  config(staticName: string) {
    this.router.navigate([`fields/${staticName}`], { relativeTo: this.route.firstChild });
  }

  openPermissions() {
    this.router.navigate([GoToPermissions.goApp(this.context.appId)], { relativeTo: this.route.firstChild });
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

  openSystemSettings() {
    this.dialogService.openAppsManagement(this.context.zoneId, 'settings');
  }

  analyze(part: AnalyzePart) {
    this.router.navigate([`analyze/${part}`], { relativeTo: this.route.firstChild });
  }
}
