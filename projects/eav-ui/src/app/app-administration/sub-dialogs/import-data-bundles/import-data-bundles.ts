import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { transient } from '../../../../../../core';
import { FileUploadDialogComponent, FileUploadDialogData, UploadTypes } from '../../../shared/components/file-upload-dialog';
import { DataBundlesService } from '../../import-export-menu/data-bundles/data-bundles.service';
@Component({
  selector: 'app-import-data-bundles',
  templateUrl: './import-data-bundles.html',
  imports: [
    FileUploadDialogComponent,
  ]
})
export class ImportDataBundlesComponent {
  private dataBundlesService = transient(DataBundlesService);

  uploadType = UploadTypes.ContentType;

  constructor(@Inject(MAT_DIALOG_DATA) dialogData: FileUploadDialogData) {
    dialogData.title ??= `Import Data Types`;
    dialogData.description ??= `Select Data Bundles definition file (json) from your computer to import.`;
    dialogData.allowedFileTypes ??= 'json';
    dialogData.multiple ??= true;
    dialogData.upload$ ??= (files) => this.dataBundlesService.import(files);
  }
}
