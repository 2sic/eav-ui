import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { StreamErrorData } from '../models';
import { StreamErrorResultDialogData } from './stream-error-result.models';

@Component({
  selector: 'app-stream-error-result',
  templateUrl: './stream-error-result.component.html',
  styleUrls: ['./stream-error-result.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
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
}
