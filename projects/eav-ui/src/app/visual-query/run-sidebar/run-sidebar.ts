import { Component, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleChange, MatSlideToggleModule } from '@angular/material/slide-toggle';
import { transient } from '../../../../../core';
import { GoToDevRest } from '../../dev-rest';
import { JsonHelpers } from '../../shared/helpers/json.helpers';
import { DialogRoutingService } from '../../shared/routing/dialog-routing.service';
import { Context } from '../../shared/services/context';
import { VisualDesignerDataForQuery } from '../models/visual-designer-data';
import { VisualQueryStateService } from '../services/visual-query.service';
import { calculateWarnings } from './query-warnings.helpers';

@Component({
  selector: 'app-run-explorer',
  templateUrl: './run-sidebar.html',
  styleUrls: ['./run-sidebar.scss'],
  imports: [
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
  ]
})
export class RunExplorerComponent {

  private context = inject(Context);
  protected vsSvc = inject(VisualQueryStateService);


  warningSig = computed<string[]>(
    () => calculateWarnings(this.vsSvc.pipelineModel() ?? null, this.context)
  );

  visualDesignerDataSig = computed<VisualDesignerDataForQuery>(
    () => JsonHelpers.tryParse(this.vsSvc.pipelineModel()?.Pipeline.VisualDesignerData) ?? {}
  );

  #dialogRouter = transient(DialogRoutingService);

  constructor() {}

  editPipeline() {
    this.vsSvc.editPipelineEntity();
  }

  saveAndRunQuery(save: boolean, run: boolean) {
    this.vsSvc.saveAndRun(save, run);
  }

  showDataSourceDetails(event: MatSlideToggleChange): void {
    this.vsSvc.sourceEditor.showDataSourceDetails(event.checked);
  }

  openRestApi() {
    const queryGuid = this.vsSvc.pipelineModel().Pipeline.EntityGuid;
    this.#dialogRouter.navRelative([GoToDevRest.getUrlQueryDialog(queryGuid)]);
  }
}
