import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { ContentItemsService } from '../../content-items/services/content-items.service';
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
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppConfigurationComponent implements OnInit {
  @Input() dialogSettings: DialogSettings;
  eavConstants = eavConstants;

  constructor(
    private contentItemsService: ContentItemsService,
    private router: Router,
    private route: ActivatedRoute,
    private context: Context,
    // 2020-11-10 2dm experimental
    private exportAppService: ExportAppService,
    private importer: ImportAppPartsService,
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
    this.router.navigate(
      [`permissions/${eavConstants.metadata.app.type}/${eavConstants.keyTypes.number}/${this.context.appId}`],
      { relativeTo: this.route.firstChild }
    );
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
    // this.isExporting$.next(true);
    this.exportAppService.exportForVersionControl(true, false).subscribe({
      next: res => {
        // this.isExporting$.next(false);
        alert('Done - please check your \'.data\' folder');
      },
      error: (error: HttpErrorResponse) => {
        // this.isExporting$.next(false);
      },
    });
  }

  // experimental
  resetApp() {
    if (!confirm('Are you sure? All changes since then will be lost')) { return; }
    this.importer.resetApp().subscribe({
      next: result => {
        // this.isImporting$.next(false);
        // this.importResult$.next(result);
        this.snackBar.open('Reset worked!', null, { duration: 3000 });
      },
      error: (error: HttpErrorResponse) => {
        // this.isImporting$.next(false);
        // this.importResult$.next(null);
        this.snackBar.open('Reset failed. Please check console for more information', null, { duration: 3000 });
      },
    });
  }
}
