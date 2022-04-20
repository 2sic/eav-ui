import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FileUploadDialogData } from '../shared/components/file-upload-dialog';
import { ImportAppService } from './services/import-app.service';

@Component({
  selector: 'app-import-app',
  templateUrl: './import-app.component.html',
  styleUrls: ['./import-app.component.scss'],
})
export class ImportAppComponent {

  constructor(@Inject(MAT_DIALOG_DATA) dialogData: FileUploadDialogData, importAppService: ImportAppService) {
    dialogData.title ??= `Import App`;
    dialogData.description ??= `
    Select an app package (zip) from your computer to import an app. New apps can be downloaded on
    <a href="https://2sxc.org/apps" target="_blank">https://2sxc.org/apps</a>.
    For further help visit <a href="https://2sxc.org/en/help?tag=import-app" target="_blank">2sxc Help</a>.
    `;
    dialogData.allowedFileTypes ??= 'zip';
    dialogData.upload$ ??= (files) => importAppService.importApp(files[0], undefined, true);
  }

}
