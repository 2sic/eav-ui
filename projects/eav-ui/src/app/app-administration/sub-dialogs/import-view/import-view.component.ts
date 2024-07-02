import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FileUploadDialogComponent, FileUploadDialogData, UploadTypes } from '../../../shared/components/file-upload-dialog';
import { ViewsService } from '../../services/views.service';
import { transient } from '../../../core';

@Component({
  selector: 'app-import-view',
  templateUrl: './import-view.component.html',
  styleUrls: ['./import-view.component.scss'],
  standalone: true,
  imports: [
    FileUploadDialogComponent,
  ],
})
export class ImportViewComponent {

  uploadType = UploadTypes.View;
  
  private viewsService = transient(ViewsService);
  
  constructor(
    @Inject(MAT_DIALOG_DATA) dialogData: FileUploadDialogData,
  ) {
    dialogData.title ??= `Import View`;
    dialogData.description ??= `Select a View file (json) from your computer to import.`;
    dialogData.allowedFileTypes ??= 'json';
    dialogData.upload$ ??= (files) => this.viewsService.import(files[0]);
  }

}
