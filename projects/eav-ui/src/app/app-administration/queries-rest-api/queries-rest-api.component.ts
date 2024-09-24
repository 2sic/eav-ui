import { AsyncPipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { RouterOutlet } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { transient } from '../../core';
import { DevRestQueryComponent } from '../../dev-rest/query/query.component';
import { eavConstants } from '../../shared/constants/eav.constants';
import { SxcGridModule } from '../../shared/modules/sxc-grid-module/sxc-grid.module';
import { DialogRoutingService } from '../../shared/routing/dialog-routing.service';
import { Query } from '../models';
import { PipelinesService } from '../services';

@Component({
  selector: 'app-web-api-rest-api',
  standalone: true,
  imports: [
    MatSelectModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    ReactiveFormsModule,
    AsyncPipe,
    DevRestQueryComponent,
    RouterOutlet,
    SxcGridModule,
  ],
  templateUrl: './queries-rest-api.component.html',
})
export class QueriesRestApiComponent {
  #pipelinesSvc = transient(PipelinesService);
  #dialogRouter = transient(DialogRoutingService);

  queryTypes$ = new BehaviorSubject<Query[]>(undefined);
  queryTypeForm: FormGroup;


  constructor(
    private fb: FormBuilder,
  ) { }

  ngOnInit() {
    this.fetchQueries();
    this.queryTypeForm = this.fb.group({
      queryType: ['']
    });
  }

  fetchQueries() {
    this.#pipelinesSvc.getAll(eavConstants.contentTypes.query).subscribe((queries: Query[]) => {
      this.queryTypes$.next(queries);

      // When Route are reload and have some Guid in the Route
      const urlSegments = this.#dialogRouter.url.split('/');
      const urlGuidName = urlSegments[urlSegments.length - 1]

      const selectedContentType = queries.find(query => query.Guid === urlGuidName);
      if (selectedContentType)
        this.queryTypeForm.get('queryType').setValue(selectedContentType.Guid);
    });
  }

  openRestApi(event: string): void {
    if (!event) return;
    this.#dialogRouter.navParentFirstChild([`${event}`]);
  }
}
