import { Component, OnInit, ChangeDetectionStrategy, Input, OnChanges, SimpleChanges } from '@angular/core';

import { Context } from '../../shared/services/context';

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
      this.refreshWarnings(this.queryDef.data);
    }
  }

  editPipelineEntity() {
    alert('Not working!');
  }

  openParamsHelp() {
    window.open('https://r.2sxc.org/QueryParams', '_blank');
  }

  /**
   * check if there are special warnings the developer should know
   * typically when the test-module-id is different from the one we're currently
   * working on, or if no test-module-id is provided
   * note: this should actually be external code, and injected later on
   * reason is that it's actually testing for a 2sxc-variable mid
   */
  private refreshWarnings(pipelineData: any) {
    this.warnings = [];
    try { // catch various not-initialized errors
      const regex = /^\[module:moduleid\]=([0-9]*)$/gmi; // capture the mod-id
      const testParams = pipelineData.Pipeline.TestParameters;
      const matches = regex.exec(testParams);
      const testMid = matches[1];
      const urlMid = this.context.moduleId.toString();
      if (testMid !== urlMid) {
        // tslint:disable-next-line:max-line-length
        this.warnings.push(`Your test moduleid (${testMid}) is different from the current moduleid (${urlMid}). Note that 2sxc 9.33 automatically provides the moduleid - so you usually do not need to set it any more.`);
      }
    } catch (error) { }
  }

}
