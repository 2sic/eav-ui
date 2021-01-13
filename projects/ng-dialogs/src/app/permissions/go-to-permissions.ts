import { Route } from '@angular/router';
import { eavConstants } from '../shared/constants/eav.constants';

/**
 * Navigation system to access permissions dialogs as sub-dialogs for many use cases
 */
export const GoToPermissions = {

  go(targetType: number, keyType: string, key: string) {
    return `permissions/${targetType}/${keyType}/${key}`;
  },

  /** Go to edit permissions for entity */
  goEntity(key: string) {
    return this.go(eavConstants.metadata.entity.type, eavConstants.keyTypes.guid, key);
  },

  /** Go to edit permissions for content-type. For historic reasons, it's the same as Entity */
  goContentType(key: string) {
    return this.goEntity(key);
  },

  goAttribute(id: number) {
    return this.go(eavConstants.metadata.attribute.type, eavConstants.keyTypes.number, id);
  },

  goApp(appId: number) {
    return this.go(eavConstants.metadata.app.type, eavConstants.keyTypes.number, appId);
  },

  /**
   * The route definition for use in all routing components which can route to this dialog
   */
  route: {
    path: 'permissions/:type/:keyType/:key',
    loadChildren: () => import('./permissions.module').then(m => m.PermissionsModule),
    data: { title: 'Permission' },
  } as Route,
};
