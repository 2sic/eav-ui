import { JsonPipe } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { EavWindow } from '../../shared/models/eav-window.model';
import { StreamErrorData } from '../models';
import { StreamErrorResultDialogData } from './stream-error-result.models';

declare const window: EavWindow;

@Component({
    selector: 'app-stream-error-result',
    templateUrl: './stream-error-result.html',
    styleUrls: ['./stream-error-result.scss'],
    imports: [
        MatButtonModule,
        MatIconModule,
        MatDialogActions,
        JsonPipe,
    ]
})
export class StreamErrorResultComponent implements OnInit {
  errorData: StreamErrorData;

  constructor(
    @Inject(MAT_DIALOG_DATA) private dialogData: StreamErrorResultDialogData,
    private dialog: MatDialogRef<StreamErrorResultComponent>,
  ) { }

  ngOnInit() {
    this.errorData = this.dialogData.errorData;
  }

  closeDialog() {
    this.dialog.close();
  }

  openInsights() {
    window.open(window.$2sxc.http.apiUrl('sys/insights/logs?key=web-api-query'), '_blank');
  }
}
