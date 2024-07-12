import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FileUploadDialogComponent, FileUploadDialogData, UploadTypes } from '../../../shared/components/file-upload-dialog';
import { ContentTypesService } from '../../services/content-types.service';
import { transient } from '../../../core';
@Component({
  selector: 'app-import-content-type',
  templateUrl: './import-content-type.component.html',
  styleUrls: ['./import-content-type.component.scss'],
  standalone: true,
  imports: [
    FileUploadDialogComponent,
  ],
})
export class ImportContentTypeComponent {

  private contentTypesService = transient(ContentTypesService);

  uploadType = UploadTypes.ContentType;

  constructor(@Inject(MAT_DIALOG_DATA) dialogData: FileUploadDialogData) {
    dialogData.title ??= `Import Content Type`;
    dialogData.description ??= `Select Content Type definition file (json) from your computer to import.`;
    dialogData.allowedFileTypes ??= 'json';
    dialogData.multiple ??= true;
    dialogData.upload$ ??= (files) => this.contentTypesService.import(files);
  }

}
