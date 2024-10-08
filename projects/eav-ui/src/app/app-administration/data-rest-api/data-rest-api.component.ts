import { AsyncPipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { RouterOutlet } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { transient } from '../../../../../core';
import { DevRestDataComponent } from '../../dev-rest/data/data.component';
import { SxcGridModule } from '../../shared/modules/sxc-grid-module/sxc-grid.module';
import { DialogRoutingService } from '../../shared/routing/dialog-routing.service';
import { ContentType } from '../models';
import { ContentTypesService } from '../services';

@Component({
  selector: 'app-data-rest-api',
  standalone: true,
  imports: [
    MatSelectModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    ReactiveFormsModule,
    AsyncPipe,
    DevRestDataComponent,
    RouterOutlet,
    SxcGridModule,
  ],
  templateUrl: './data-rest-api.component.html',
})
export class DataRestApiComponent {
  #contentTypesSvc = transient(ContentTypesService);
  #dialogRouter = transient(DialogRoutingService);

  contentTypes$ = new BehaviorSubject<ContentType[]>(undefined);
  contentTypes: ContentType[] = [];

  contentTypeForm: FormGroup;

  constructor(
    private fb: FormBuilder,
  ) { }

  ngOnInit() {
    this.fetchData();
    this.contentTypeForm = this.fb.group({
      contentType: ['']
    });
  }

  fetchData() {
    this.#contentTypesSvc.retrieveContentTypes("Default").subscribe(
      (contentTypes: ContentType[]) => {
        this.contentTypes$.next(contentTypes);
        // When Route are reload and have some StaticName in the Route
        const urlSegments = this.#dialogRouter.url.split('/');
        const urlStaticName = urlSegments[urlSegments.length - 1]

        const selectedContentType = contentTypes.find(contentType => contentType.StaticName === urlStaticName);
        if (selectedContentType)
          this.contentTypeForm.get('contentType').setValue(selectedContentType.StaticName);
      }
    );
  }

  openRestApi(event: string): void {
    if (!event) return;
    this.#dialogRouter.navParentFirstChild([`${event}`]);
  }
}
