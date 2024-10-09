import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { transient } from '../../../../../../core';
import { FileUploadDialogComponent, FileUploadDialogData, UploadTypes } from '../../../shared/components/file-upload-dialog';
import { PipelinesService } from '../../services/pipelines.service';

@Component({
  selector: 'app-import-query',
  templateUrl: './import-query.component.html',
  standalone: true,
  imports: [FileUploadDialogComponent,],
})
export class ImportQueryComponent {
  uploadType = UploadTypes.Query;

  private pipelinesService = transient(PipelinesService);

  constructor(@Inject(MAT_DIALOG_DATA) dialogData: FileUploadDialogData) {
    dialogData.title ??= `Import Query`;
    dialogData.description ??= `Select a Query file (json) from your computer to import.`;
    dialogData.allowedFileTypes ??= 'json';
    dialogData.upload$ ??= (files) => this.pipelinesService.importQuery(files[0]);
  }

}
