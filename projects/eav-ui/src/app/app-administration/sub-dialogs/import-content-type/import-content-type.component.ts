import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FileUploadDialogData, UploadTypes } from '../../../shared/components/file-upload-dialog';
import { ContentTypesService } from '../../services/content-types.service';
import { SharedComponentsModule } from '../../../shared/shared-components.module';

@Component({
    selector: 'app-import-content-type',
    templateUrl: './import-content-type.component.html',
    styleUrls: ['./import-content-type.component.scss'],
    standalone: true,
    imports: [SharedComponentsModule],
})
export class ImportContentTypeComponent {

  uploadType = UploadTypes.ContentType;

  constructor(@Inject(MAT_DIALOG_DATA) dialogData: FileUploadDialogData, contentTypesService: ContentTypesService) {
    dialogData.title ??= `Import Content Type`;
    dialogData.description ??= `Select Content Type definition file (json) from your computer to import.`;
    dialogData.allowedFileTypes ??= 'json';
    dialogData.multiple ??= true;
    dialogData.upload$ ??= (files) => contentTypesService.import(files);
  }

}
