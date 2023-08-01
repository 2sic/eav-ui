import { Component, Inject } from '@angular/core';
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { FileUploadDialogData } from '../../shared/components/file-upload-dialog';
import { ContentItemsService } from '../services/content-items.service';

@Component({
  selector: 'app-content-item-import',
  templateUrl: './content-item-import.component.html',
  styleUrls: ['./content-item-import.component.scss'],
})
export class ContentItemImportComponent {

  constructor(@Inject(MAT_DIALOG_DATA) dialogData: FileUploadDialogData, contentItemsService: ContentItemsService) {
    dialogData.title ??= `Import Single Item`;
    dialogData.description ??= `Select an item file (json) from your computer to import.`;
    dialogData.allowedFileTypes ??= 'json';
    dialogData.upload$ ??= (files) => contentItemsService.importItem(files[0]);
  }

}
