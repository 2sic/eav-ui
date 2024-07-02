import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FileUploadDialogComponent, FileUploadDialogData, UploadTypes } from '../../../shared/components/file-upload-dialog';
import { PipelinesService } from '../../services/pipelines.service';
import { SharedComponentsModule } from '../../../shared/shared-components.module';

@Component({
  selector: 'app-import-query',
  templateUrl: './import-query.component.html',
  styleUrls: ['./import-query.component.scss'],
  standalone: true,
  imports: [SharedComponentsModule, FileUploadDialogComponent,],
})
export class ImportQueryComponent {

  uploadType = UploadTypes.Query;

  constructor(@Inject(MAT_DIALOG_DATA) dialogData: FileUploadDialogData, pipelinesService: PipelinesService) {
    dialogData.title ??= `Import Query`;
    dialogData.description ??= `Select a Query file (json) from your computer to import.`;
    dialogData.allowedFileTypes ??= 'json';
    dialogData.upload$ ??= (files) => pipelinesService.importQuery(files[0]);
  }

}
