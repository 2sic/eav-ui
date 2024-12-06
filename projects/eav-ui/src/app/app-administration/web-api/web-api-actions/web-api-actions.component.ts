import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';
import { Component } from '@angular/core';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { ActivatedRoute, Router } from '@angular/router';
import { GoToDevRest } from '../../../dev-rest/go-to-dev-rest';
import { TippyDirective } from '../../../shared/directives/tippy.directive';
import { WebApi } from '../../models/web-api.model';
import { WebApiActionsParams } from './web-api-actions.models';

@Component({
    selector: 'app-web-api-actions',
    templateUrl: './web-api-actions.component.html',
    imports: [
        MatRippleModule,
        MatIconModule,
        MatMenuModule,
        TippyDirective,
    ]
})
export class WebApiActionsComponent implements ICellRendererAngularComp {
  enableCode: boolean;
  private params: ICellRendererParams & WebApiActionsParams;

  constructor(private router: Router, private route: ActivatedRoute) { }


  agInit(params: ICellRendererParams & WebApiActionsParams): void {
    this.params = params;
    this.enableCode = this.params.enableCodeGetter();
  }

  refresh(params?: any): boolean {
    return true;
  }

  openCode(): void {
    const api: WebApi = this.params.data;
    this.params.onOpenCode(api);
  }

  openRestApi(): void {
    const api: WebApi = this.params.data;
    // Get the current URL and split it into segments
    const urlSegments = this.router.url.split('/');
    // Replace the last segment with the GoToDevRest.routeWebApi (restapiwebapi)
    urlSegments[urlSegments.length - 1] = GoToDevRest.routeWebApi;
    // Add the path of the api to the url segments
    urlSegments.push(encodeURIComponent(api.path));
    // Join the segments back together to form the new URL
    const apiUrl = urlSegments.join('/');

    this.router.navigate([apiUrl]);

    // this.params.onOpenRestApi(api);
  }
}
