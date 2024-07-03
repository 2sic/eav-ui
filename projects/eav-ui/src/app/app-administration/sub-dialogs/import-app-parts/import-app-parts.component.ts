import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FileUploadDialogComponent, FileUploadDialogData, UploadTypes } from '../../../shared/components/file-upload-dialog';
import { ImportAppPartsService } from '../../services/import-app-parts.service';
import { transient } from '../../../core';

@Component({
  selector: 'app-import-app-parts',
  templateUrl: './import-app-parts.component.html',
  styleUrls: ['./import-app-parts.component.scss'],
  standalone: true,
  imports: [FileUploadDialogComponent,],
})
export class ImportAppPartsComponent {

  uploadType = UploadTypes.AppPart;

  private importAppPartsService = transient(ImportAppPartsService);

  constructor(@Inject(MAT_DIALOG_DATA) dialogData: FileUploadDialogData) {
    dialogData.title ??= `Import Content and Templates into this App`;
    dialogData.description ??= `
    Import content and templates from a content export (zip) or partial export (xml) to this app.
    The entire content of the selected file will be imported.
    If you want to import an entire app, go to the <em>Apps Management</em>.
    For further help visit <a href="https://2sxc.org/en/help?tag=import" target="_blank">2sxc Help</a>.
    `;
    dialogData.allowedFileTypes ??= 'xml';
    dialogData.upload$ ??= (files) => this.importAppPartsService.importAppParts(files[0]);
  }

}
