import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { transient } from '../../../../core';
import { FileUploadDialogComponent, FileUploadDialogData, UploadTypes } from '../shared/components/file-upload-dialog';
import { ImportAppService } from './services/import-app.service';

@Component({
    selector: 'app-import-app',
    templateUrl: './import-app.component.html',
    imports: [
        FileUploadDialogComponent,
    ]
})
export class ImportAppComponent {

  uploadType = UploadTypes.App;

  private importAppService = transient(ImportAppService);

  constructor(@Inject(MAT_DIALOG_DATA) dialogData: FileUploadDialogData) {
    dialogData.title ??= `Import App`;
    dialogData.description ??= `
    Select an app package (zip) from your computer to import an app. New apps can be downloaded on
    <a href="https://2sxc.org/apps" target="_blank">https://2sxc.org/apps</a>.
    For further help visit <a href="https://2sxc.org/en/help?tag=import-app" target="_blank">2sxc Help</a>.
    `;
    dialogData.allowedFileTypes ??= 'zip';
    dialogData.upload$ ??= (files, name) => this.importAppService.importApp(files[0], name, true);
  }
}
