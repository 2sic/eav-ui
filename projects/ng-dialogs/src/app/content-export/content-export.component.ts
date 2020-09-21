import { ChangeDetectionStrategy, Component, HostBinding, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { Language } from '../../../../edit/shared/models/eav/language';
import { ContentExport } from '../app-administration/models/content-export.model';
import { AppDialogConfigService } from '../app-administration/services/app-dialog-config.service';
import { ContentExportService } from '../app-administration/services/content-export.service';

@Component({
  selector: 'app-content-export',
  templateUrl: './content-export.component.html',
  styleUrls: ['./content-export.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContentExportComponent implements OnInit, OnDestroy {
  @HostBinding('className') hostClass = 'dialog-component';

  formValues: ContentExport;
  languages: Language[];
  itemIds: number[];
  hasIdList = false;
  loading$ = new BehaviorSubject(false);

  constructor(
    private dialogRef: MatDialogRef<ContentExportComponent>,
    private route: ActivatedRoute,
    private contentExportService: ContentExportService,
    private appDialogConfigService: AppDialogConfigService,
  ) {
    const selectedIds = this.route.snapshot.paramMap.get('selectedIds');
    this.hasIdList = !!selectedIds;
    if (this.hasIdList) {
      this.itemIds = selectedIds.split(',').map(id => parseInt(id, 10));
    }
  }

  ngOnInit() {
    this.loading$.next(true);
    this.appDialogConfigService.getDialogSettings().subscribe(dialogSettings => {
      const languages = dialogSettings.Context.Language.All;
      this.languages = Object.keys(languages).map(key => ({ key, name: languages[key] }));

      this.formValues = {
        defaultLanguage: dialogSettings.Context.Language.Primary,
        contentTypeStaticName: this.route.snapshot.paramMap.get('contentTypeStaticName'),
        language: '',
        recordExport: this.hasIdList ? 'Selection' : 'All',
        languageReferences: 'Link',
        resourcesReferences: 'Link',
      };
      this.loading$.next(false);
    });
  }

  ngOnDestroy() {
    this.loading$.complete();
  }

  closeDialog() {
    this.dialogRef.close();
  }

  exportContent() {
    this.contentExportService.exportContent(this.formValues,
      this.hasIdList && this.formValues.recordExport === 'Selection' ? this.itemIds : null);
  }

  exportJson() {
    this.contentExportService.exportJson(this.formValues.contentTypeStaticName);
  }
}
