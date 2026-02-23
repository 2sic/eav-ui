import { Route } from '@angular/router';
import { ContentType } from '../app-administration/models';

const base = 'restapi';

export class GoToDevRest {
  static routeQuery = 'restapiquery';
  static routeData = 'restapidata';
  static routeWebApi = 'restapiwebapi';

  static navLabel = 'Rest-Api';
  static icon = 'code-curly';

  static routeDataDefinition = {
    name: GoToDevRest.navLabel,
    icon: GoToDevRest.icon,
    svgIcon: true,
    path: GoToDevRest.routeData,
    tippy: 'Rest-Api Data'
  };

  static routeQueryDefinition = {
    name: GoToDevRest.navLabel,
    icon: GoToDevRest.icon,
    svgIcon: true,
    path: GoToDevRest.routeQuery,
    tippy: 'Rest-Api Queries'
  };

  static routeWebApiDefinition = {
    name: GoToDevRest.navLabel,
    icon: GoToDevRest.icon,
    svgIcon: true,
    path: GoToDevRest.routeWebApi
  };

  static paramTypeName: 'contentTypeStaticName';
  static paramQuery: 'queryGuid';
  static paramApiPath: 'webApiPath';
  static route: Route = {
    path: base,
    loadChildren: () => import('./dev-rest.routing').then(m => m.devRestRoutes),
  };

  // todo: setup not quite elegant, using relative route. Should be refactored to use absolute route
  /** Route to Data REST - for use in Admin-List */
  static getUrlData(contentType: ContentType): string {
    return `../../${GoToDevRest.routeData}/${contentType.NameId}`;
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
}
