import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { transient } from '../../../../../core';
import { FileUploadDialogComponent, FileUploadDialogData, UploadTypes } from '../../shared/components/file-upload-dialog';
import { ContentItemsService } from '../services/content-items.service';

@Component({
    selector: 'app-import-content-item',
    templateUrl: './import-content-item.component.html',
    imports: [FileUploadDialogComponent,]
})
export class ImportContentItemComponent {

  uploadType = UploadTypes.ContentItem;

  private contentItemsService = transient(ContentItemsService);

  constructor(@Inject(MAT_DIALOG_DATA) dialogData: FileUploadDialogData) {
    dialogData.title ??= `Import Single Item`;
    dialogData.description ??= `Select an item file (json) from your computer to import.`;
    dialogData.allowedFileTypes ??= 'json';
    dialogData.upload$ ??= (files) => this.contentItemsService.importItem(files[0]);
  }

}
