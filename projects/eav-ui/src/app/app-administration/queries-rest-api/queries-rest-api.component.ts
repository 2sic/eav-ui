import { Component, computed, effect, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { RouterOutlet } from '@angular/router';
import { transient } from '../../../../../core';
import { RestApiHelpTextComponent } from '../../shared/components/rest-api-help-text/rest-api-help-text';
import { eavConstants } from '../../shared/constants/eav.constants';
import { classLog } from '../../shared/logging';
import { SxcGridModule } from '../../shared/modules/sxc-grid-module/sxc-grid.module';
import { DialogRoutingService } from '../../shared/routing/dialog-routing.service';
import { Query } from '../models';
import { PipelinesService } from '../services';

const logSpecs = {
  all: false,
  queryTypes: true,
};

@Component({
    selector: 'app-web-api-rest-api',
    imports: [
        MatSelectModule,
        MatButtonModule,
        MatCardModule,
        MatIconModule,
        ReactiveFormsModule,
        RouterOutlet,
        SxcGridModule,
        RestApiHelpTextComponent,
    ],
    templateUrl: './queries-rest-api.component.html'
})
export class QueriesRestApiComponent {
  log = classLog({ QueriesRestApiComponent }, logSpecs);

  #pipelinesSvc = transient(PipelinesService);
  #dialogRouter = transient(DialogRoutingService);

  #formBuilder = inject(FormBuilder);

  constructor() {
    // Update form if the url changes and the item is found
    effect(() => {
      const queryTypes = this.queryTypes();
      if (queryTypes.length === 0)
        return;
      const urlGuidName = this.#dialogRouter.urlSegments.at(-1);
      const selectedContentType = queryTypes.find(q => q.Guid === urlGuidName);
      if (selectedContentType)
        this.queryTypeForm.get('queryType').setValue(selectedContentType.Guid);
    });
  }

  #getAllQueryTypes = this.#pipelinesSvc.getAllRes(eavConstants.contentTypes.query, []);

  queryTypes = computed<Query[]>(() => {
    const l = this.log.fnIf('queryTypes');
    const queries = this.#getAllQueryTypes.value();
    return l.r(queries || []);
  }, { });

  queryTypeForm: FormGroup = this.#formBuilder.group({
    queryType: ['']
  });

  openRestApi(event: string): void {
    if (!event) return;
    this.#dialogRouter.navRelative([`${event}`]);
  }
}
