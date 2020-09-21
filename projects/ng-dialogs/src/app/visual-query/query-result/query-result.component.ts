import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PipelineResultQuery, PipelineResultSources, PipelineResultStream } from '../models/pipeline-result.model';
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
  sources: PipelineResultSources;
  streams: PipelineResultStream[];

  constructor(@Inject(MAT_DIALOG_DATA) public data: QueryResultDialogData, private dialogRef: MatDialogRef<QueryResultComponent>) { }

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
