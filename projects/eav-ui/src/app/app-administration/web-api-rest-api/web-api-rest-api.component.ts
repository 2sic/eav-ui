import { Component, computed, effect, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { RouterOutlet } from '@angular/router';
import { transient } from '../../../../../core';
import { SourceService } from '../../code-editor/services/source.service';
import { classLog } from '../../shared/logging';
import { SxcGridModule } from '../../shared/modules/sxc-grid-module/sxc-grid.module';
import { DialogRoutingService } from '../../shared/routing/dialog-routing.service';

const logSpecs = {
  all: false,
  webApisTypes: true,
  syncUrl: true,
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
    ],
    templateUrl: './web-api-rest-api.component.html'
})
export class WebApiRestApiComponent {
  log = classLog({ WebApiRestApiComponent }, logSpecs);
  #sourceSvc = transient(SourceService);
  #dialogRouter = transient(DialogRoutingService);

  #formBuilder = inject(FormBuilder);

  constructor() {
    // Update form if the url changes and the item is found
    effect(() => {
      const l = this.log.fnIf('syncUrl');
      const webApis = this.webApisTypes();
      if (webApis.length === 0)
        return l.end();
      const urlPath = this.#dialogRouter.urlSegments.at(-1);

      var encodedUrlPath = urlPath.replace(/%252F/g, "/");

      const webApi = webApis.find(w => w.path === encodedUrlPath);
      l.a('status:', { webApis, webApi, urlPath, encodedUrlPath });
      if (webApi)
        this.webApiTypeForm.get('webApiType').setValue(webApi.path);
      l.end();
    });
  }

  #getAllWebApis = this.#sourceSvc.getWebApisSig();

  webApisTypes = computed(() => {
    const webApis = this.#getAllWebApis();
    return webApis;
  });

  webApiTypeForm: FormGroup = this.#formBuilder.group({
    webApiType: ['']
  });

  openRestApi(apiRoute: string): void {
    if (!apiRoute) return;
    this.#dialogRouter.navRelative([encodeURIComponent(apiRoute)]);
  }
}
