import { Route } from '@angular/router';
import { ContentType, Query, WebApi } from '../app-administration/models';

const base = 'restapi';

export const DevRestNavigation = {
  routeData: 'data',
  paramTypeName: 'contentTypeStaticName',
  paramQuery: 'queryGuid',
  paramApiPath: 'webApiPath',

  goToData(contentType: ContentType) {
    return `${base}/data/${contentType.StaticName}`;
  },

  goToQuery(query: Query) {
    return `${base}/query/${query.Guid}`;
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
