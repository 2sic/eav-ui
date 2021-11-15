import { Route } from '@angular/router';

export class GoToMetadata {

  static getRoutes(): Route[] {
    const defaultRoute: Route = {
      path: 'metadata/:type/:keyType/:key',
      loadChildren: () => import('./metadata.module').then(m => m.MetadataModule),
      data: { title: 'Metadata' },
    };
    const routes: Route[] = [
      defaultRoute,
      {
        ...defaultRoute,
        path: `${defaultRoute.path}/title/:title`,
      },
      {
        ...defaultRoute,
        path: `${defaultRoute.path}/contentType/:contentTypeStaticName`,
      },
      {
        ...defaultRoute,
        path: `${defaultRoute.path}/title/:title/contentType/:contentTypeStaticName`,
      }
    ];
    return routes;
  }

  static getUrl(targetType: number, keyType: string, key: string, title?: string, contentTypeStaticName?: string): string {
    let url = `metadata/${targetType}/${keyType}/${key}`;
    if (title) {
      url += `/title/${title}`;
    }
    if (contentTypeStaticName) {
      url += `/contentType/${contentTypeStaticName}`;
    }
    return url;
  }

}
