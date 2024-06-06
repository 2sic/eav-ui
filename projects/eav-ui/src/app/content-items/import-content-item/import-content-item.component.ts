import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FileUploadDialogData, UploadTypes } from '../../shared/components/file-upload-dialog';
import { ContentItemsService } from '../services/content-items.service';
import { SharedComponentsModule } from '../../shared/shared-components.module';

@Component({
    selector: 'app-import-content-item',
    templateUrl: './import-content-item.component.html',
    styleUrls: ['./import-content-item.component.scss'],
    standalone: true,
    imports: [SharedComponentsModule],
})
export class ImportContentItemComponent {

  uploadType = UploadTypes.ContentItem;

  constructor(@Inject(MAT_DIALOG_DATA) dialogData: FileUploadDialogData, contentItemsService: ContentItemsService) {
    dialogData.title ??= `Import Single Item`;
    dialogData.description ??= `Select an item file (json) from your computer to import.`;
    dialogData.allowedFileTypes ??= 'json';
    dialogData.upload$ ??= (files) => contentItemsService.importItem(files[0]);
  }

}
