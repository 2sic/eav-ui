import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { ContentExportDialogData } from '../../models/content-export-dialog-data.model';
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
  itemIds = []; // spm Figure out how to get to list of ids and what it means
  hasIdList: boolean; // spm Figure out how to get to list of ids and what it means

  constructor(
    private dialogRef: MatDialogRef<ContentExportComponent>,
    @Inject(MAT_DIALOG_DATA) public contentExportDialogData: ContentExportDialogData,
    private contentExportService: ContentExportService,
  ) {
    this.hasIdList = (Array.isArray(this.itemIds) && this.itemIds.length > 0);
    this.formValues = {
      appId: this.contentExportDialogData.appId,
      defaultLanguage: 'en-US', // spm Figure out what default language is
      contentTypeStaticName: this.contentExportDialogData.staticName,
      language: 'All',
      recordExport: this.hasIdList ? 'Selection' : 'All',
      languageReferences: 'Link',
      resourcesReferences: 'Link',
    };
  }

  ngOnInit() {
  }

  exportContent() {
    // http://petar-pc2.sistemi.corp/en-us/desktopmodules/2sxc/api/eav/ContentExport/ExportContent
    // ?appId=17&language=&defaultLanguage=en-US&contentType=80adb152-efad-4aa4-855e-74c5ef230e1f
    // &recordExport=All&resourcesReferences=Link&languageReferences=Link
    this.contentExportService.exportContent(this.formValues,
      this.hasIdList && this.formValues.recordExport === 'Selection' ? this.itemIds : null);
  }

  exportJson() {
    this.contentExportService.exportJson(this.contentExportDialogData.appId, this.formValues.contentTypeStaticName);
  }

  closeDialog() {
    this.dialogRef.close();
  }

}
