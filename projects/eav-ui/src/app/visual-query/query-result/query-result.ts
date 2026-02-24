import { JsonPipe, KeyValuePipe } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { DialogHeaderComponent } from "../../shared/dialog-header/dialog-header";
import { DebugStreamInfo } from '../models/debug-stream-info.model';
import { QueryResult } from '../models/result/pipeline-result';
import { VisualQueryStateService } from '../services/visual-query.service';
import { QueryResultDialogData } from './query-result.models';

@Component({
    selector: 'app-query-result',
    templateUrl: './query-result.html',
    styleUrls: ['./query-result.scss'],
    imports: [
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    JsonPipe,
    KeyValuePipe,
    DialogHeaderComponent,
]
})
export class QueryResultComponent implements OnInit {
  parameters: string[];
  timeUsed: number;
  ticksUsed: number;
  top: number;
  optionsForTop: number[];
  result: Record<string, unknown>[];
  debugStream: DebugStreamInfo;
  sources: QueryResult["Sources"];
  streams: QueryResult["Streams"];

  constructor(
    @Inject(MAT_DIALOG_DATA) private dialogData: QueryResultDialogData,
    private dialog: MatDialogRef<QueryResultComponent>,
    private visualQueryService: VisualQueryStateService,
  ) { }

  ngOnInit() {
    const pipeline = this.visualQueryService.pipelineModel().Pipeline;
    const params = (pipeline.Params?.split('\n') ?? []).filter(el => !!el);
    const testParams = (pipeline.TestParameters?.split('\n') ?? []).filter(el => !!el);
    this.parameters = [].concat(params, testParams);
    this.timeUsed = this.dialogData.result.QueryTimer.Milliseconds;
    this.ticksUsed = this.dialogData.result.QueryTimer.Ticks;
    this.top = this.dialogData.top;
    this.optionsForTop = [25, 100, 1000, 0];

    const result = this.dialogData.result.Query;
    const streamTabs = Object.keys(result).map(key => ({
      name: key + ' (' + Object.keys(result[key]).length + ')',
      data: { [key]: result[key] }
    }));
    this.result = [
      { name: 'All Data', data: result },
      ...streamTabs
    ];

    this.debugStream = this.dialogData.debugStream;
    this.sources = this.dialogData.result.Sources;
    this.streams = this.dialogData.result.Streams;
  }

  closeDialog() {
    this.dialog.close();
  }

  show(top: number) {
    if (top === this.top) return;

    if (this.debugStream) {
      this.visualQueryService.debugStream(this.debugStream.original, top);
    } else {
      this.visualQueryService.runPipeline(top);
    }

    this.closeDialog();
  }
}
