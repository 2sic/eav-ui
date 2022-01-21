import { Route } from '@angular/router';
import { eavConstants, MetadataKeyType } from '../shared/constants/eav.constants';

export class GoToPermissions {

  static route: Route = {
    path: 'permissions/:targetType/:keyType/:key',
    loadChildren: () => import('./permissions.module').then(m => m.PermissionsModule),
    data: { title: 'Permissions' },
  };

  static getUrl(targetType: number, keyType: MetadataKeyType, key: string): string {
    return `permissions/${targetType}/${keyType}/${key}`;
  }

  static getUrlApp(appId: number): string {
    return this.getUrl(eavConstants.metadata.app.targetType, eavConstants.metadata.app.keyType, appId.toString());
  }

  static getUrlAttribute(id: number): string {
    return this.getUrl(eavConstants.metadata.attribute.targetType, eavConstants.metadata.attribute.keyType, id.toString());
  }

  /** For historic reasons, it's the same as Entity */
  static getUrlContentType(guid: string): string {
    return this.getUrlEntity(guid);
  }

  static getUrlEntity(guid: string): string {
    return this.getUrl(eavConstants.metadata.entity.targetType, eavConstants.metadata.entity.keyType, guid);
  }

  static getUrlLanguage(cultureCode: string): string {
    return this.getUrl(eavConstants.metadata.language.targetType, eavConstants.metadata.language.keyType, cultureCode.toLocaleLowerCase());
  }

}
