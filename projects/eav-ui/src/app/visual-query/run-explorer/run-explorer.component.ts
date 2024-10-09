import { AsyncPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleChange, MatSlideToggleModule } from '@angular/material/slide-toggle';
import { map, Observable } from 'rxjs';
import { transient } from '../../../../../core';
import { GoToDevRest } from '../../dev-rest';
import { JsonHelpers } from '../../shared/helpers/json.helpers';
import { DialogRoutingService } from '../../shared/routing/dialog-routing.service';
import { Context } from '../../shared/services/context';
import { PipelineModel } from '../models';
import { VisualQueryStateService } from '../services/visual-query.service';
import { calculateWarnings } from './run-explorer.helpers';

@Component({
  selector: 'app-run-explorer',
  templateUrl: './run-explorer.component.html',
  styleUrls: ['./run-explorer.component.scss'],
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    AsyncPipe,
  ],
})
export class RunExplorerComponent implements OnInit {
  pipelineModel$: Observable<PipelineModel>;
  warnings$: Observable<string[]>;
  visualDesignerData$: Observable<Record<string, any>>;

  #dialogRouter = transient(DialogRoutingService);
  
  constructor(
    private context: Context,
    private visualQueryService: VisualQueryStateService,
  ) { }

  ngOnInit() {
    this.pipelineModel$ = this.visualQueryService.pipelineModel$.asObservable();
    this.warnings$ = this.visualQueryService.pipelineModel$.pipe(
      map(pipelineModel => calculateWarnings(pipelineModel, this.context)),
    );
    this.visualDesignerData$ = this.visualQueryService.pipelineModel$.pipe(
      map(pipelineModel => JsonHelpers.tryParse(pipelineModel.Pipeline.VisualDesignerData) ?? {}),
    );
  }

  editPipeline() {
    this.visualQueryService.editPipelineEntity();
  }

  openParamsHelp() {
    window.open('https://go.2sxc.org/QueryParams', '_blank');
  }

  saveAndRunQuery(save: boolean, run: boolean) {
    this.visualQueryService.saveAndRun(save, run);
  }

  showDataSourceDetails(event: MatSlideToggleChange): void {
    this.visualQueryService.showDataSourceDetails(event.checked);
  }

  openRestApi() {
    const queryGuid = this.visualQueryService.pipelineModel$.value.Pipeline.EntityGuid;
    this.#dialogRouter.navRelative([GoToDevRest.getUrlQueryDialog(queryGuid)]);
  }
}
