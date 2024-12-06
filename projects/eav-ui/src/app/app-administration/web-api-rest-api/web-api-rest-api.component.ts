import { Component, computed } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { RouterOutlet } from '@angular/router';
import { transient } from '../../../../../core';
import { SourceService } from '../../code-editor/services/source.service';
import { DevRestQueryComponent } from '../../dev-rest/query/query.component';
import { SxcGridModule } from '../../shared/modules/sxc-grid-module/sxc-grid.module';
import { DialogRoutingService } from '../../shared/routing/dialog-routing.service';

@Component({
    selector: 'app-web-api-rest-api',
    imports: [
        MatSelectModule,
        MatButtonModule,
        MatCardModule,
        MatIconModule,
        ReactiveFormsModule,
        DevRestQueryComponent,
        RouterOutlet,
        SxcGridModule,
    ],
    templateUrl: './web-api-rest-api.component.html'
})
export class WebApiRestApiComponent {
  #sourceSvc = transient(SourceService);
  #dialogRouter = transient(DialogRoutingService);

  #getAllWebApis = this.#sourceSvc.getWebApisSig();

  webApisTypes = computed(() => {
    const webApis = this.#getAllWebApis();
    const urlSegments = this.#dialogRouter.url.split('/');
    const urlPath = urlSegments[urlSegments.length - 1]
    var encodedUrlPath = urlPath.replace("%252F", "/");

    const selectedContentType = webApis.find(webApi => webApi.path === encodedUrlPath);

    if (selectedContentType)
      this.webApiTypeForm.get('webApiType').setValue(selectedContentType.path);

    return webApis;
  });

  webApiTypeForm: FormGroup = this.fb.group({
    webApiType: ['']
  });

  constructor(private fb: FormBuilder,) { }

  openRestApi(apiRoute: string): void {
    if (!apiRoute) return;
    this.#dialogRouter.navRelative([encodeURIComponent(apiRoute)]);
  }
}
