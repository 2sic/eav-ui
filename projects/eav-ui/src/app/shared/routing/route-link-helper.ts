import { RouteContextInfo } from './route-context-info';

export class RouteLinkHelper {

  routeTo(context: RouteContextInfo, path: string) {
    return `${this.routeRoot(context)}/${path}`;
  }


  routeRoot(context: RouteContextInfo) {
    const route = `${context.zoneId}/v2/${context.moduleId}/${context.contentBlockId}/${context.appId}`;
    return route;
  }
  
}