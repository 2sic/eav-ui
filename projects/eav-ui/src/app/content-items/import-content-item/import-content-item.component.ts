import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FileUploadDialogData } from '../../shared/components/file-upload-dialog';
import { ContentItemsService } from '../services/content-items.service';

@Component({
  selector: 'app-import-content-item',
  templateUrl: './import-content-item.component.html',
  styleUrls: ['./import-content-item.component.scss'],
})
export class ImportContentItemComponent {

  constructor(@Inject(MAT_DIALOG_DATA) dialogData: FileUploadDialogData, contentItemsService: ContentItemsService) {
    dialogData.title ??= `Import Single Item`;
    dialogData.description ??= `Select an item file (json) from your computer to import.`;
    dialogData.allowedFileTypes ??= 'json';
    dialogData.upload$ ??= (files) => contentItemsService.importItem(files[0]);
  }

}
