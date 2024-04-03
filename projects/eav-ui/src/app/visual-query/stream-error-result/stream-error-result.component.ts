import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogActions } from '@angular/material/dialog';
import { EavWindow } from '../../shared/models/eav-window.model';
import { StreamErrorData } from '../models';
import { StreamErrorResultDialogData } from './stream-error-result.models';
import { JsonPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { SharedComponentsModule } from '../../shared/shared-components.module';
import { MatButtonModule } from '@angular/material/button';

declare const window: EavWindow;

@Component({
    selector: 'app-stream-error-result',
    templateUrl: './stream-error-result.component.html',
    styleUrls: ['./stream-error-result.component.scss'],
    standalone: true,
    imports: [
        MatButtonModule,
        SharedComponentsModule,
        MatIconModule,
        MatDialogActions,
        JsonPipe,
    ],
})
export class StreamErrorResultComponent implements OnInit {
  errorData: StreamErrorData;

  constructor(
    @Inject(MAT_DIALOG_DATA) private dialogData: StreamErrorResultDialogData,
    private dialogRef: MatDialogRef<StreamErrorResultComponent>,
  ) { }

  ngOnInit() {
    this.errorData = this.dialogData.errorData;
  }

  closeDialog() {
    this.dialogRef.close();
  }

  openInsights() {
    window.open(window.$2sxc.http.apiUrl('sys/insights/logs?key=web-api-query'), '_blank');
  }
}
