import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { transient } from 'projects/core';
import { FileUploadDialogComponent, FileUploadDialogData, UploadTypes } from '../../../shared/components/file-upload-dialog';
import { AppExtensionsService } from '../../services/app-extensions.service';

@Component({
  selector: 'app-import-data-bundles',
  templateUrl: './import-extension.component.html',
  imports: [
    FileUploadDialogComponent,
  ]
})
export class ImportExtensionComponent {

  private ExtensionsService = transient(AppExtensionsService);

  uploadType = UploadTypes.Extension;

  constructor(@Inject(MAT_DIALOG_DATA) dialogData: FileUploadDialogData) {
    dialogData.title ??= `Import Extension`;
    dialogData.description ??= `Select Extension folder from your computer to import.`;
    dialogData.allowedFileTypes ??= '';
    dialogData.multiple ??= true;
    dialogData.upload$ ??= (files) => this.ExtensionsService.uploadExtensions(files[0].name, files);
  }
}