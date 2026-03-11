import { Component } from '@angular/core';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { ActivatedRoute, Router } from '@angular/router';
import { GoToDevRest } from '../../../dev-rest/go-to-dev-rest';
import { AgGridActionsBaseComponent } from '../../../shared/ag-grid/ag-grid-actions-base';
import { TippyDirective } from '../../../shared/directives/tippy.directive';
import { WebApi } from '../../models/web-api.model';

export type WebApiActionsVerb = 'code' | 'restApi';

export interface WebApiActionsParams {
  enableCode: boolean;
  do(verb: WebApiActionsVerb, data: WebApi): void;
}

@Component({
  selector: 'app-web-api-actions',
  templateUrl: './web-api-actions.html',
  imports: [
    MatRippleModule,
    MatIconModule,
    MatMenuModule,
    TippyDirective,
  ],
})
export class WebApiActionsComponent extends AgGridActionsBaseComponent<WebApi, WebApiActionsVerb> {
  declare params: WebApiActionsParams;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
  ) {
    super();
  }

  get enableCode(): boolean { return !!this.params?.enableCode; }

  override do(verb: WebApiActionsVerb): void {
    switch (verb) {
      case 'code':
        super.do(verb);
        break;
      case 'restApi':
        this.openRestApi();
        break;
    }
  }

  private openRestApi(): void {
    const api = this.data;
    if (!api) {
      return;
    }

    const urlSegments = this.router.url.split('/');
    urlSegments[urlSegments.length - 1] = GoToDevRest.routeWebApi;
    urlSegments.push(encodeURIComponent(api.path));

    const apiUrl = urlSegments.join('/');
    this.router.navigate([apiUrl], { relativeTo: this.route });
  }
}