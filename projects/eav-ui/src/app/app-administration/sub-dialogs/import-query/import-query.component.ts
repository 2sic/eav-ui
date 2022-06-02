import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FileUploadDialogData } from '../../../shared/components/file-upload-dialog';
import { PipelinesService } from '../../services/pipelines.service';

@Component({
  selector: 'app-import-query',
  templateUrl: './import-query.component.html',
  styleUrls: ['./import-query.component.scss'],
})
export class ImportQueryComponent {

  constructor(@Inject(MAT_DIALOG_DATA) dialogData: FileUploadDialogData, pipelinesService: PipelinesService) {
    dialogData.title ??= `Import Query`;
    dialogData.description ??= `Select a Query file (json) from your computer to import.`;
    dialogData.allowedFileTypes ??= 'json';
    dialogData.upload$ ??= (files) => pipelinesService.importQuery(files[0]);
  }

}
