import { Route } from '@angular/router';
import { eavConstants } from '../shared/constants/eav.constants';

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

  static getUrl(targetType: number, keyType: string, key: string, dialogTitle?: string, contentTypeStaticName?: string): string {
    let url = `metadata/${targetType}/${keyType}/${key}`;
    if (dialogTitle) {
      url += `/title/${encodeURIComponent(dialogTitle)}`;
    }
    if (contentTypeStaticName) {
      url += `/contentType/${contentTypeStaticName}`;
    }
    return url;
  }

  static getUrlApp(appId: number, dialogTitle?: string): string {
    return this.getUrl(
      eavConstants.metadata.app.type,
      eavConstants.metadata.app.keyType,
      appId.toString(),
      dialogTitle,
    );
  }

  static getUrlContentType(staticName: string, dialogTitle?: string): string {
    return this.getUrl(
      eavConstants.metadata.contentType.type,
      eavConstants.metadata.contentType.keyType,
      staticName,
      dialogTitle,
    );
  }

  static getUrlEntity(guid: string, dialogTitle?: string, contentTypeStaticName?: string): string {
    return this.getUrl(
      eavConstants.metadata.entity.type,
      eavConstants.metadata.entity.keyType,
      guid,
      dialogTitle,
      contentTypeStaticName,
    );
  }

}
