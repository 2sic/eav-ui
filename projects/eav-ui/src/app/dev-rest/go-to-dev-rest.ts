import { Route } from '@angular/router';
import { ContentType, WebApi } from '../app-administration/models';

const base = 'restapi';

export class GoToDevRest {
  static routeQuery = 'restapiquery';
  static routeData = 'restapidata';

  static paramTypeName: 'contentTypeStaticName';
  static paramQuery: 'queryGuid';
  static paramApiPath: 'webApiPath';
  static route: Route = {
    path: base,
    loadChildren: () => import('./dev-rest.module').then(m => m.DevRestModule),
  };

  // todo: setup not quite elegant, using relative route. Should be refactored to use absolute route
  /** Route to Data REST - for use in Admin-List */
  static getUrlData(contentType: ContentType): string {
    return `../../${GoToDevRest.routeData}/${contentType.StaticName}`;
    // return `${base}/data/${contentType.StaticName}`;
  }

  /** Route to Query REST in dialog mode - for visual query */
  static getUrlQueryDialog(guid: string): string {
    return `${base}/query/${guid}`;
  }

  // todo: setup not quite elegant, using relative route. Should be refactored to use absolute route
  /** Route to Query in Admin UI - for use in Admin-List */
  static getUrlQueryInAdmin(guid: string): string {
    return `../${GoToDevRest.routeQuery}/${guid}`;
  }

  static getUrlWebApi(api: WebApi): string {
    return `${base}/custom/${encodeURIComponent(api.path)}`;
  }
}
