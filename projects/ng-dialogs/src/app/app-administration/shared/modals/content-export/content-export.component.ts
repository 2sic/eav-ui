import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';

import { ContentExport } from '../../models/content-export.model';
import { ContentExportService } from '../../services/content-export.service';
import { Language } from '../../../../../../../edit/shared/models/eav';

@Component({
  selector: 'app-content-export',
  templateUrl: './content-export.component.html',
  styleUrls: ['./content-export.component.scss']
})
export class ContentExportComponent implements OnInit {
  formValues: ContentExport;
  languages: Language[] = JSON.parse(sessionStorage.langs);
  itemIds: number[];
  hasIdList = false;

  constructor(
    private dialogRef: MatDialogRef<ContentExportComponent>,
    private route: ActivatedRoute,
    private contentExportService: ContentExportService,
  ) {
    const selectedIds = this.route.snapshot.paramMap.get('selectedIds');
    this.hasIdList = !!selectedIds;
    if (this.hasIdList) {
      this.itemIds = selectedIds.split(',').map(id => parseInt(id, 10));
    }
    this.formValues = {
      defaultLanguage: sessionStorage.langpri,
      contentTypeStaticName: this.route.snapshot.paramMap.get('contentTypeStaticName'),
      language: 'All',
      recordExport: this.hasIdList ? 'Selection' : 'All',
      languageReferences: 'Link',
      resourcesReferences: 'Link',
    };
  }

  ngOnInit() {
  }

  exportContent() {
    this.contentExportService.exportContent(this.formValues,
      this.hasIdList && this.formValues.recordExport === 'Selection' ? this.itemIds : null);
  }

  exportJson() {
    this.contentExportService.exportJson(this.formValues.contentTypeStaticName);
  }

  closeDialog() {
    this.dialogRef.close();
  }

}
