import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FileUploadDialogData } from '../../../shared/components/file-upload-dialog';
import { ContentTypesService } from '../../services/content-types.service';

@Component({
  selector: 'app-import-content-type',
  templateUrl: './import-content-type.component.html',
  styleUrls: ['./import-content-type.component.scss'],
})
export class ImportContentTypeComponent {

  constructor(@Inject(MAT_DIALOG_DATA) dialogData: FileUploadDialogData, contentTypesService: ContentTypesService) {
    dialogData.title ??= `Import Content Type`;
    dialogData.description ??= `Select Content Type definition file (json) from your computer to import.`;
    dialogData.allowedFileTypes ??= 'json';
    dialogData.multiple ??= true;
    dialogData.upload$ ??= (files) => contentTypesService.import(files);
  }

}
