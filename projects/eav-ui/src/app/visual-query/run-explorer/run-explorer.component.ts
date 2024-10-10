import { AsyncPipe } from '@angular/common';
import { Component, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleChange, MatSlideToggleModule } from '@angular/material/slide-toggle';
import { transient } from '../../../../../core';
import { GoToDevRest } from '../../dev-rest';
import { JsonHelpers } from '../../shared/helpers/json.helpers';
import { DialogRoutingService } from '../../shared/routing/dialog-routing.service';
import { Context } from '../../shared/services/context';
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
export class RunExplorerComponent {

  warningSig = signal<string[]>(
    calculateWarnings(this.vsSvc?.pipelineModelSig() ?? null, this.context)
  );

  visualDesignerDataSig = signal<Record<string, any>>(
    JsonHelpers.tryParse(this.vsSvc?.pipelineModelSig()?.Pipeline.VisualDesignerData) ?? {}
  );

  #dialogRouter = transient(DialogRoutingService);

  constructor(
    private context: Context,
    public vsSvc: VisualQueryStateService,
  ) { }

  editPipeline() {
    this.vsSvc.editPipelineEntity();
  }

  openParamsHelp() {
    window.open('https://go.2sxc.org/QueryParams', '_blank');
  }

  saveAndRunQuery(save: boolean, run: boolean) {
    this.vsSvc.saveAndRun(save, run);
  }

  showDataSourceDetails(event: MatSlideToggleChange): void {
    this.vsSvc.showDataSourceDetails(event.checked);
  }

  openRestApi() {
    const queryGuid = this.vsSvc.pipelineModelSig().Pipeline.EntityGuid;
    this.#dialogRouter.navRelative([GoToDevRest.getUrlQueryDialog(queryGuid)]);
  }
}
