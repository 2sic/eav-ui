import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { GoToDevRest } from '../../dev-rest';
import { Context } from '../../shared/services/context';
import { PipelineModel } from '../models';
import { VisualQueryService } from '../services/visual-query.service';
import { calculateWarnings } from './run-explorer.helpers';

@Component({
  selector: 'app-run-explorer',
  templateUrl: './run-explorer.component.html',
  styleUrls: ['./run-explorer.component.scss'],
})
export class RunExplorerComponent implements OnInit {
  pipelineModel$: Observable<PipelineModel>;
  warnings$: Observable<string[]>;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private context: Context,
    private visualQueryService: VisualQueryService,
  ) { }

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
    window.open('http://r.2sxc.org/QueryParams', '_blank');
  }

  saveAndRunQuery(save: boolean, run: boolean) {
    this.visualQueryService.saveAndRun(save, run);
  }

  openRestApi() {
    const queryGuid = this.visualQueryService.pipelineModel$.value.Pipeline.EntityGuid;
    this.router.navigate([GoToDevRest.getUrlQuery(queryGuid)], { relativeTo: this.route });
  }
}
