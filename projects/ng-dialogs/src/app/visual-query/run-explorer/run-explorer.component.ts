import { Component, OnInit, ChangeDetectionStrategy, Input, OnChanges, SimpleChanges } from '@angular/core';

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
  warnings: any[];

  constructor(private context: Context, ) { }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.queryDef?.currentValue) {
      this.warnings = calculateWarnings(this.queryDef.data, this.context);
    }
  }

  editPipelineEntity() {
    alert('Not implemented!');
  }

  openParamsHelp() {
    window.open('https://r.2sxc.org/QueryParams', '_blank');
  }

}
