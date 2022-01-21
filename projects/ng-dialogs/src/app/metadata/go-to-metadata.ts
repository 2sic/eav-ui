import { Route } from '@angular/router';
import { eavConstants, MetadataKeyType } from '../shared/constants/eav.constants';

export class GoToMetadata {

  static getRoutes(): Route[] {
    const defaultRoute: Route = {
      path: 'metadata/:targetType/:keyType/:key',
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

  static getUrl(targetType: number, keyType: MetadataKeyType, key: string, dialogTitle?: string, contentTypeStaticName?: string): string {
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
      eavConstants.metadata.app.targetType,
      eavConstants.metadata.app.keyType,
      appId.toString(),
      dialogTitle,
    );
  }

  static getUrlAttribute(attributeId: number, dialogTitle?: string, contentTypeStaticName?: string): string {
    return this.getUrl(
      eavConstants.metadata.attribute.targetType,
      eavConstants.metadata.attribute.keyType,
      attributeId.toString(),
      dialogTitle,
      contentTypeStaticName,
    );
  }

  static getUrlContentType(staticName: string, dialogTitle?: string): string {
    return this.getUrl(
      eavConstants.metadata.contentType.targetType,
      eavConstants.metadata.contentType.keyType,
      staticName,
      dialogTitle,
    );
  }

  static getUrlEntity(guid: string, dialogTitle?: string, contentTypeStaticName?: string): string {
    return this.getUrl(
      eavConstants.metadata.entity.targetType,
      eavConstants.metadata.entity.keyType,
      guid,
      dialogTitle,
      contentTypeStaticName,
    );
  }

}
