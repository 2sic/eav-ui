import { Component, OnInit, Inject, ChangeDetectionStrategy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-query-result',
  templateUrl: './query-result.component.html',
  styleUrls: ['./query-result.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QueryResultComponent implements OnInit {
  testParameters: any;
  timeUsed: number;
  ticksUsed: number;
  result: any;
  sources: any;
  streams: any;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private dialogRef: MatDialogRef<QueryResultComponent>) { }

  ngOnInit() {
    this.testParameters = this.data.testParameters;
    this.timeUsed = this.data.result.QueryTimer.Milliseconds;
    this.ticksUsed = this.data.result.QueryTimer.Ticks;
    this.result = this.data.result.Query;
    this.sources = this.data.result.Sources;
    this.streams = this.data.result.Streams;
  }

  closeDialog() {
    this.dialogRef.close();
  }

}
