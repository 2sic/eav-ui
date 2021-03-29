import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DebugStreamInfo, PipelineResultQuery, PipelineResultSources, PipelineResultStream } from '../models';
import { QueryResultDialogData } from './query-result.models';

@Component({
  selector: 'app-query-result',
  templateUrl: './query-result.component.html',
  styleUrls: ['./query-result.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QueryResultComponent implements OnInit {
  testParameters: string;
  timeUsed: number;
  ticksUsed: number;
  result: PipelineResultQuery;
  debugStream: DebugStreamInfo;
  sources: PipelineResultSources;
  streams: PipelineResultStream[];

  constructor(@Inject(MAT_DIALOG_DATA) private dialogData: QueryResultDialogData, private dialogRef: MatDialogRef<QueryResultComponent>) { }

  ngOnInit() {
    this.testParameters = this.dialogData.testParameters;
    this.timeUsed = this.dialogData.result.QueryTimer.Milliseconds;
    this.ticksUsed = this.dialogData.result.QueryTimer.Ticks;
    this.result = this.dialogData.result.Query;
    this.debugStream = this.dialogData.debugStream;
    this.sources = this.dialogData.result.Sources;
    this.streams = this.dialogData.result.Streams;
  }

  closeDialog() {
    this.dialogRef.close();
  }
}
