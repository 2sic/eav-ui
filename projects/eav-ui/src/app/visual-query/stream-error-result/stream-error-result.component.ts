import { Component, Inject, OnInit } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { EavWindow } from '../../shared/models/eav-window.model';
import { StreamErrorData } from '../models';
import { StreamErrorResultDialogData } from './stream-error-result.models';

declare const window: EavWindow;

@Component({
  selector: 'app-stream-error-result',
  templateUrl: './stream-error-result.component.html',
  styleUrls: ['./stream-error-result.component.scss'],
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
    window.open(window.$2sxc.http.apiUrl('sys/insights/logs?key=web-api'), '_blank');
  }
}
