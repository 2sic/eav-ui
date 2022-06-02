import { Route } from '@angular/router';
import { ContentType, WebApi } from '../app-administration/models';

const base = 'restapi';

export class GoToDevRest {
  static paramTypeName: 'contentTypeStaticName';
  static paramQuery: 'queryGuid';
  static paramApiPath: 'webApiPath';
  static route: Route = {
    path: base,
    loadChildren: () => import('./dev-rest.module').then(m => m.DevRestModule),
  };

  static getUrlData(contentType: ContentType): string {
    return `${base}/data/${contentType.StaticName}`;
  }

  static getUrlQuery(guid: string): string {
    return `${base}/query/${guid}`;
  }

  static getUrlWebApi(api: WebApi): string {
    return `${base}/custom/${encodeURIComponent(api.path)}`;
  }
}
