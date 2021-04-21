import { Route } from '@angular/router';
import { ContentType, WebApi } from '../app-administration/models';

const base = 'restapi';

export const GoToDevRest = {
  routeData: 'data',
  paramTypeName: 'contentTypeStaticName',
  paramQuery: 'queryGuid',
  paramApiPath: 'webApiPath',

  goToData(contentType: ContentType) {
    return `${base}/data/${contentType.StaticName}`;
  },

  goToQuery(queryGuid: string) {
    return `${base}/query/${queryGuid}`;
  },

  goToWebApi(api: WebApi) {
    return `${base}/custom/${encodeURIComponent(api.path)}`;
  },

  /**
   * The route definition for use in all routing components which can route to this dialog
   */
  route: {
    path: base,
    loadChildren: () => import('./dev-rest.module').then(m => m.DevRestModule)
  } as Route,
};
