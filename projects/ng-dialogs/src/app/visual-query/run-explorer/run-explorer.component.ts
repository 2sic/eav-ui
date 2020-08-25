import { Component, OnInit, ChangeDetectionStrategy, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';

import { Context } from '../../shared/services/context';
import { SaveRun } from '../models/save-run.model';
import { calculateWarnings } from './run-explorer.helpers';
import { QueryDef } from '../models/query-def.model';

@Component({
  selector: 'app-run-explorer',
  templateUrl: './run-explorer.component.html',
  styleUrls: ['./run-explorer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RunExplorerComponent implements OnInit, OnChanges {
  @Input() queryDef: QueryDef;
  @Output() editPipelineEntity = new EventEmitter<null>();
  @Output() saveAndRun = new EventEmitter<SaveRun>();
  @Output() repaint = new EventEmitter<null>();

  warnings: string[] = [];

  constructor(private context: Context) { }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.queryDef?.currentValue) {
      this.warnings = calculateWarnings(this.queryDef.data, this.context);
    }
  }

  editPipeline() {
    this.editPipelineEntity.emit();
  }

  openParamsHelp() {
    window.open('https://r.2sxc.org/QueryParams', '_blank');
  }

  saveAndRunQuery(save: boolean, run: boolean) {
    this.saveAndRun.emit({ save, run });
  }

  doRepaint() {
    this.repaint.emit();
  }

}
