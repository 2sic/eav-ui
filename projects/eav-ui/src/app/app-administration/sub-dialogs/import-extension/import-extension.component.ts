import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { transient } from 'projects/core';
import { FileUploadDialogComponent, FileUploadDialogData, UploadTypes } from '../../../shared/components/file-upload-dialog';
import { AppExtensionsService } from '../../services/app-extensions.service';
import { InspectExtensionContentComponent } from '../inspect-extension/inspect-extension-content/inspect-extension-content.component';

@Component({
  selector: 'app-import-extension',
  templateUrl: './import-extension.component.html',
  imports: [
    FileUploadDialogComponent,
    InspectExtensionContentComponent,
  ]
})
export class ImportExtensionComponent {
  private extensionSvc = transient(AppExtensionsService);

  uploadType = UploadTypes.Extension;
  
  constructor(@Inject(MAT_DIALOG_DATA) dialogData: FileUploadDialogData) {
    dialogData.title ??= `Import Extension`;
    dialogData.description ??= `Select Extension folder from your computer to import.`;
    dialogData.allowedFileTypes ??= 'zip';
    dialogData.multiple ??= true;
    dialogData.upload$ ??= (files) => this.extensionSvc.uploadExtensions(files);
  }
}