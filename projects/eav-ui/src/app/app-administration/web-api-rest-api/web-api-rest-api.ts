import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { RouterOutlet } from '@angular/router';
import { transient } from '../../../../../core';
import { classLog } from '../../../../../shared/logging';
import { SourceService } from '../../code-editor/services/source.service';
import { RestApiHelpTextComponent } from '../../shared/components/rest-api-help-text/rest-api-help-text';
import { SxcGridModule } from '../../shared/modules/sxc-grid-module/sxc-grid.module';
import { DialogRoutingService } from '../../shared/routing/dialog-routing.service';
import { syncFormWithLastUrlSegment } from '../helper/sync-form-with-last-url-segment';

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
    RestApiHelpTextComponent
  ],
  templateUrl: './web-api-rest-api.html'
})
export class WebApiRestApiComponent {
  log = classLog({ WebApiRestApiComponent }, logSpecs);
  #sourceSvc = transient(SourceService);
  #dialogRouter = transient(DialogRoutingService);

  #formBuilder = inject(FormBuilder);

  constructor() {
    syncFormWithLastUrlSegment(this.#dialogRouter, {
      items: () => this.webApisTypes(),
      control: () => this.webApiTypeForm.get('webApiType'),
      decode: s => s.replace(/%252F/g, '/'),
      itemKey: w => w.path,
      onMatch: (match, ctx) => {
        const l = this.log.fnIf('syncUrl');
        l?.a?.('status:', { ...ctx, match });
        l?.end?.();
      },
    });
  }

  #refresh = signal(0);
  #getAllWebApis = this.#sourceSvc.getWebApisLive(this.#refresh)

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
