import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FileUploadDialogData } from '../../../shared/components/file-upload-dialog';
import { ViewsService } from '../../services/views.service';

@Component({
  selector: 'app-import-view',
  templateUrl: './import-view.component.html',
  styleUrls: ['./import-view.component.scss'],
})
export class ImportViewComponent {

  constructor(@Inject(MAT_DIALOG_DATA) dialogData: FileUploadDialogData, viewsService: ViewsService) {
    dialogData.title ??= `Import View`;
    dialogData.description ??= `Select a View file (json) from your computer to import.`;
    dialogData.allowedFileTypes ??= 'json';
    dialogData.upload$ ??= (files) => viewsService.import(files[0]);
  }

}
