import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FileUploadDialogData } from '../../../shared/components/file-upload-dialog';
import { ImportAppPartsService } from '../../services/import-app-parts.service';

@Component({
  selector: 'app-import-app-parts',
  templateUrl: './import-app-parts.component.html',
  styleUrls: ['./import-app-parts.component.scss'],
})
export class ImportAppPartsComponent {

  constructor(@Inject(MAT_DIALOG_DATA) dialogData: FileUploadDialogData, importAppPartsService: ImportAppPartsService) {
    dialogData.title ??= `Import Content and Templates into this App`;
    dialogData.description ??= `
    Import content and templates from a content export (zip) or partial export (xml) to this app.
    The entire content of the selected file will be imported.
    If you want to import an entire app, go to the <em>Apps Management</em>.
    For further help visit <a href="https://2sxc.org/en/help?tag=import" target="_blank">2sxc Help</a>.
    `;
    dialogData.allowedFileTypes ??= 'xml';
    dialogData.upload$ ??= (files) => importAppPartsService.importAppParts(files[0]);
  }

}
