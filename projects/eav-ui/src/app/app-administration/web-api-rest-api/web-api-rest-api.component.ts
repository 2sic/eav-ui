import { AsyncPipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { RouterOutlet } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { SourceService } from '../../code-editor/services/source.service';
import { transient } from '../../core';
import { DevRestQueryComponent } from '../../dev-rest/query/query.component';
import { SxcGridModule } from '../../shared/modules/sxc-grid-module/sxc-grid.module';
import { DialogRoutingService } from '../../shared/routing/dialog-routing.service';
import { WebApi } from '../models';

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
  templateUrl: './web-api-rest-api.component.html',
})
export class WebApiRestApiComponent {
  #sourceSvc = transient(SourceService);
  #dialogRouter = transient(DialogRoutingService);
  webApis$ = new BehaviorSubject<WebApi[]>(undefined);
  webApiTypeForm: FormGroup;

  constructor(
    private fb: FormBuilder,
  ) { }

  ngOnInit() {
    this.fetchWebApis();
    this.webApiTypeForm = this.fb.group({
      webApiType: ['']
    });
  }

  fetchWebApis() {
    this.#sourceSvc.getWebApis().subscribe((webApis: WebApi[]) => {
      this.webApis$.next(webApis);
      // When Route are reload and have some Guid in the Route
      const urlSegments = this.#dialogRouter.url.split('/');
      const urlPath = urlSegments[urlSegments.length - 1]
      var encodedUrlPath = urlPath.replace("%252F", "/");

      const selectedContentType = webApis.find(webApi => webApi.path === encodedUrlPath);

      if (selectedContentType)
        this.webApiTypeForm.get('webApiType').setValue(selectedContentType.path);
    });
  }

  openRestApi(apiRoute: string): void {
    if (!apiRoute) return;
    this.#dialogRouter.navParentFirstChild([encodeURIComponent(apiRoute)]);
  }
}
