import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DebugStreamInfo, PipelineResultQuery, PipelineResultSources, PipelineResultStream } from '../models';
import { VisualQueryService } from '../services/visual-query.service';
import { QueryResultDialogData } from './query-result.models';

@Component({
  selector: 'app-query-result',
  templateUrl: './query-result.component.html',
  styleUrls: ['./query-result.component.scss'],
})
export class QueryResultComponent implements OnInit {
  parameters: string[];
  timeUsed: number;
  ticksUsed: number;
  top: number;
  optionsForTop: number[];
  result: PipelineResultQuery;
  debugStream: DebugStreamInfo;
  sources: PipelineResultSources;
  streams: PipelineResultStream[];

  constructor(
    @Inject(MAT_DIALOG_DATA) private dialogData: QueryResultDialogData,
    private dialogRef: MatDialogRef<QueryResultComponent>,
    private visualQueryService: VisualQueryService,
  ) { }

  ngOnInit() {
    const pipeline = this.visualQueryService.pipelineModel$.value.Pipeline;
    const params = (pipeline.Params?.split('\n') ?? []).filter(el => !!el);
    const testParams = (pipeline.TestParameters?.split('\n') ?? []).filter(el => !!el);
    this.parameters = [].concat(params, testParams);
    this.timeUsed = this.dialogData.result.QueryTimer.Milliseconds;
    this.ticksUsed = this.dialogData.result.QueryTimer.Ticks;
    this.top = this.dialogData.top;
    this.optionsForTop = [25, 100, 1000, 0];
    this.result = this.dialogData.result.Query;
    this.debugStream = this.dialogData.debugStream;
    this.sources = this.dialogData.result.Sources;
    this.streams = this.dialogData.result.Streams;
  }

  closeDialog() {
    this.dialogRef.close();
  }

  show(top: number) {
    if (top === this.top) { return; }

    if (this.debugStream) {
      this.visualQueryService.debugStream(this.debugStream.original, top);
    } else {
      this.visualQueryService.runPipeline(top);
    }

    this.closeDialog();
  }
}
