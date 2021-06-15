import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { ContentItemsService } from '../../content-items/services/content-items.service';
import { GoToPermissions } from '../../permissions/go-to-permissions';
import { eavConstants } from '../../shared/constants/eav.constants';
import { convertFormToUrl } from '../../shared/helpers/url-prep.helper';
import { EditForm } from '../../shared/models/edit-form.model';
import { Context } from '../../shared/services/context';
import { DialogSettings } from '../models/dialog-settings.model';
import { ExportAppService } from '../services/export-app.service';
import { ImportAppPartsService } from '../services/import-app-parts.service';

@Component({
  selector: 'app-app-configuration',
  templateUrl: './app-configuration.component.html',
  styleUrls: ['./app-configuration.component.scss'],
})
export class AppConfigurationComponent implements OnInit {
  @Input() dialogSettings: DialogSettings;
  eavConstants = eavConstants;

  constructor(
    private contentItemsService: ContentItemsService,
    private router: Router,
    private route: ActivatedRoute,
    private context: Context,
    private exportAppService: ExportAppService,
    private importAppPartsService: ImportAppPartsService,
    private snackBar: MatSnackBar,
  ) { }

  ngOnInit() {
  }

  edit(staticName: string) {
    this.contentItemsService.getAll(staticName).subscribe(contentItems => {
      if (contentItems.length !== 1) { throw new Error(`Found too many settings for the type ${staticName}`); }
      const item = contentItems[0];
      const form: EditForm = {
        items: [{ EntityId: item.Id }],
      };
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

  /** Experimental */
  resetApp() {
    if (!confirm('Are you sure? All changes since last xml export will be lost')) { return; }
    this.snackBar.open('Resetting...');
    this.importAppPartsService.resetApp().subscribe({
      next: result => {
        this.snackBar.open('Reset worked!', null, { duration: 3000 });
      },
      error: (error: HttpErrorResponse) => {
        this.snackBar.open('Reset failed. Please check console for more information', null, { duration: 3000 });
      },
    });
  }
}
