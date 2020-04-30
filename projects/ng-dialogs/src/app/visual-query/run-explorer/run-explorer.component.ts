import { Component, OnInit, ChangeDetectionStrategy, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';

import { Context } from '../../shared/services/context';
import { calculateWarnings } from './run-explorer.helpers';

@Component({
  selector: 'app-run-explorer',
  templateUrl: './run-explorer.component.html',
  styleUrls: ['./run-explorer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RunExplorerComponent implements OnInit, OnChanges {
  @Input() queryDef: any;
  @Output() editPipelineEntity: EventEmitter<null> = new EventEmitter();
  @Output() saveAndRun: EventEmitter<{ save: boolean, run: boolean }> = new EventEmitter();
  @Output() repaint: EventEmitter<null> = new EventEmitter();
  warnings: any[];

  constructor(private context: Context, ) { }

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
