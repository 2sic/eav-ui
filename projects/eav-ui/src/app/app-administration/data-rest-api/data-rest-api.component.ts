import { Component } from '@angular/core';
import { ContentTypesService } from '../services';
import { BehaviorSubject } from 'rxjs';
import { ContentType } from '../models';
import { MatSelectModule } from '@angular/material/select';
import { AsyncPipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { DevRestDataComponent } from '../../dev-rest/data/data.component';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { MetadataService } from '../../permissions';
import { transient } from '../../core';
import { SxcGridModule } from '../../shared/modules/sxc-grid-module/sxc-grid.module';

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
  styleUrl: './data-rest-api.component.scss'
})
export class DataRestApiComponent {
  private contentTypesService = transient(ContentTypesService);
  contentTypes$ = new BehaviorSubject<ContentType[]>(undefined);
  contentTypes: ContentType[] = [];

  contentTypeForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.fetchData();
    this.contentTypeForm = this.fb.group({
      contentType: ['']
    });
  }

  fetchData() {
    this.contentTypesService.retrieveContentTypes("Default").subscribe(
      (contentTypes: ContentType[]) => {
        this.contentTypes$.next(contentTypes);
        // When Route are reload and have some StaticName in the Route
        const urlSegments = this.router.url.split('/');
        const urlStaticName = urlSegments[urlSegments.length - 1]

        const selectedContentType = contentTypes.find(contentType => contentType.StaticName === urlStaticName);
        if (selectedContentType)
          this.contentTypeForm.get('contentType').setValue(selectedContentType.StaticName);
      }
    );
  }

  openRestApi(event: string): void {
    if (!event) return;
    this.router.navigate([`${event}`], { relativeTo: this.route.parent.firstChild });
  }
}
