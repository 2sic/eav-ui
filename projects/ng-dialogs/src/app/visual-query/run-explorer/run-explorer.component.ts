import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Context } from '../../shared/services/context';
import { calculateWarnings } from './run-explorer.helpers';
import { VisualQueryService } from '../services/visual-query.service';
import { PipelineModel } from '../models/pipeline.model';

@Component({
  selector: 'app-run-explorer',
  templateUrl: './run-explorer.component.html',
  styleUrls: ['./run-explorer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RunExplorerComponent implements OnInit {
  pipelineModel$: Observable<PipelineModel>;
  warnings$: Observable<string[]>;

  constructor(private context: Context, private visualQueryService: VisualQueryService) { }

  ngOnInit() {
    this.pipelineModel$ = this.visualQueryService.pipelineModel$;
    this.warnings$ = this.visualQueryService.pipelineModel$.pipe(
      map(pipelineModel => calculateWarnings(pipelineModel, this.context)),
    );
  }

  editPipeline() {
    this.visualQueryService.editPipelineEntity();
  }

  openParamsHelp() {
    window.open('https://r.2sxc.org/QueryParams', '_blank');
  }

  saveAndRunQuery(save: boolean, run: boolean) {
    this.visualQueryService.saveAndRun(save, run);
  }

}
