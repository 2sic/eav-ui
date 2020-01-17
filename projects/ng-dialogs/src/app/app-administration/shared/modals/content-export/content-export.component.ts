import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';

import { ContentExport } from '../../models/content-export.model';
import { ContentExportService } from '../../services/content-export.service';

@Component({
  selector: 'app-content-export',
  templateUrl: './content-export.component.html',
  styleUrls: ['./content-export.component.scss']
})
export class ContentExportComponent implements OnInit {
  formValues: ContentExport;
  languages = [ // spm Figure out how to get to list of languages
    { key: 'en-US', value: 'en-Us' },
    { key: 'en-US', value: 'en-Us' },
    { key: 'en-US', value: 'en-Us' },
  ];
  itemIds: number[] = []; // spm Figure out how to get to list of ids and what it means
  hasIdList: boolean; // spm Figure out how to get to list of ids and what it means

  constructor(
    private dialogRef: MatDialogRef<ContentExportComponent>,
    private route: ActivatedRoute,
    private contentExportService: ContentExportService,
  ) {
    this.hasIdList = (Array.isArray(this.itemIds) && this.itemIds.length > 0);
    this.formValues = {
      defaultLanguage: 'en-US', // spm Figure out what default language is
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
